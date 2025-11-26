import { supabase } from './supabase';
import { getProfile } from './profiles';

export interface PartnerInvitation {
  id: string;
  code: string;
  inviter_id: string;
  invitee_id: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export class InvitationError extends Error {
  constructor(
    message: string,
    public code: 'EXPIRED' | 'ALREADY_USED' | 'SELF_INVITE' | 'ALREADY_LINKED' | 'NOT_FOUND' | 'NETWORK_ERROR'
  ) {
    super(message);
    this.name = 'InvitationError';
  }
}

/**
 * Generate a unique 6-8 character alphanumeric invitation code
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 6 + Math.floor(Math.random() * 3); // 6-8 characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new partner invitation with 24-hour expiration
 */
export async function createInvitation(): Promise<PartnerInvitation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already has a partner
  const profile = await getProfile();
  if (profile?.partner_id) {
    throw new InvitationError(
      'You are already linked with a partner',
      'ALREADY_LINKED'
    );
  }

  // Check if user has an active invitation
  const activeInvitation = await getActiveInvitation();
  if (activeInvitation) {
    // Extend the expiry to 24 hours from now
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24);

    const { data, error } = await supabase
      .from('partner_invitations')
      .update({
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', activeInvitation.id)
      .select()
      .maybeSingle();

    if (error) {
      throw new InvitationError(
        `Failed to extend invitation: ${error.message}`,
        'NETWORK_ERROR'
      );
    }

    if (!data) {
      // This shouldn't happen, but handle gracefully
      throw new InvitationError(
        'Failed to extend invitation: invitation not found',
        'NETWORK_ERROR'
      );
    }

    return data;
  }

  // Generate unique code (retry if collision)
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateInvitationCode();
    const existing = await getInvitationByCode(code);
    if (!existing) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new InvitationError(
      'Failed to generate unique invitation code',
      'NETWORK_ERROR'
    );
  }

  // Create invitation with 24-hour expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const { data, error } = await supabase
    .from('partner_invitations')
    .insert({
      code,
      inviter_id: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new InvitationError(
      `Failed to create invitation: ${error.message}`,
      'NETWORK_ERROR'
    );
  }

  return data;
}

/**
 * Get invitation by code using secure RPC function
 * Normalizes code to uppercase to match database storage
 */
export async function getInvitationByCode(code: string): Promise<PartnerInvitation | null> {
  // Normalize code to uppercase to ensure case-insensitive matching
  const normalizedCode = code.toUpperCase();
  
  console.log(`[getInvitationByCode] Looking up code: ${normalizedCode} (original: ${code})`);
  
  const { data, error } = await supabase.rpc('get_invitation_by_code', {
    invitation_code: normalizedCode,
  });

  if (error) {
    console.error(`[getInvitationByCode] RPC error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    
    // If function doesn't exist yet (migration not run), fall back to direct query
    // This is a temporary fallback for development
    if (error.code === '42883') {
      console.log('[getInvitationByCode] Function not found, using fallback query');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('code', normalizedCode)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fallbackError) {
        console.error(`[getInvitationByCode] Fallback query error:`, {
          code: fallbackError.code,
          message: fallbackError.message,
        });
        if (fallbackError.code === 'PGRST116') {
          console.log('[getInvitationByCode] Invitation not found (PGRST116)');
          return null; // Not found
        }
        throw new InvitationError(
          `Failed to lookup invitation: ${fallbackError.message}`,
          'NETWORK_ERROR'
        );
      }

      console.log('[getInvitationByCode] Fallback query succeeded:', fallbackData);
      return fallbackData;
    }

    throw new InvitationError(
      `Failed to lookup invitation: ${error.message} (code: ${error.code})`,
      'NETWORK_ERROR'
    );
  }

  console.log(`[getInvitationByCode] RPC response:`, {
    data,
    isArray: Array.isArray(data),
    length: Array.isArray(data) ? data.length : 'N/A',
  });

  // RPC function returns TABLE, which Supabase returns as an array
  // Handle both array and single object responses
  if (!data) {
    console.log('[getInvitationByCode] No data returned');
    return null;
  }

  if (Array.isArray(data)) {
    const result = data.length > 0 ? data[0] : null;
    console.log(`[getInvitationByCode] Array result:`, result ? 'found' : 'not found');
    return result;
  }

  // If it's already a single object, return it
  console.log('[getInvitationByCode] Single object result:', data);
  return data;
}

/**
 * Get the current user's active (unused, unexpired) invitation
 */
export async function getActiveInvitation(): Promise<PartnerInvitation | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('partner_invitations')
    .select('*')
    .eq('inviter_id', user.id)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new InvitationError(
      `Failed to get active invitation: ${error.message}`,
      'NETWORK_ERROR'
    );
  }

  return data;
}

/**
 * Accept a partner invitation by code
 * This combines lookup and acceptance in a single atomic database operation
 * All validation (including partner check) is handled by the database function
 */
export async function acceptInvitation(code: string): Promise<PartnerInvitation> {
  // Normalize code to uppercase to ensure case-insensitive matching
  const normalizedCode = code.toUpperCase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log(`[acceptInvitation] Attempting to accept invitation with code: ${normalizedCode}`);

  // Call the RPC function which handles lookup, validation, and acceptance atomically
  const { data, error } = await supabase.rpc('accept_invitation_by_code', {
    invitation_code: normalizedCode,
    user_id: user.id,
  });

  if (error) {
    console.error(`[acceptInvitation] RPC error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    
    // If function doesn't exist, provide helpful error
    if (error.code === '42883') {
      throw new InvitationError(
        'Invitation acceptance function not available. Please run database migrations.',
        'NETWORK_ERROR'
      );
    }

    // Map database error messages to invitation error codes
    const errorMessage = error.message || '';
    if (errorMessage.includes('already linked with a partner')) {
      throw new InvitationError(
        errorMessage,
        'ALREADY_LINKED'
      );
    }
    if (errorMessage.includes('not found') || errorMessage.includes('expired')) {
      throw new InvitationError(
        errorMessage,
        'NOT_FOUND'
      );
    }
    if (errorMessage.includes('already been used')) {
      throw new InvitationError(
        errorMessage,
        'ALREADY_USED'
      );
    }
    if (errorMessage.includes('cannot accept your own')) {
      throw new InvitationError(
        errorMessage,
        'SELF_INVITE'
      );
    }
    if (errorMessage.includes('has expired')) {
      throw new InvitationError(
        errorMessage,
        'EXPIRED'
      );
    }

    throw new InvitationError(
      `Failed to accept invitation: ${errorMessage}`,
      'NETWORK_ERROR'
    );
  }

  // RPC function returns TABLE, which Supabase returns as an array
  if (!data) {
    throw new InvitationError(
      'Invitation was not found or has already been accepted',
      'NOT_FOUND'
    );
  }

  let acceptedInvitation: PartnerInvitation;
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new InvitationError(
        'Invitation was not found or has already been accepted',
        'NOT_FOUND'
      );
    }
    acceptedInvitation = data[0];
  } else {
    acceptedInvitation = data;
  }

  console.log(`[acceptInvitation] Successfully accepted invitation:`, acceptedInvitation);
  
  // The database trigger will automatically link partners
  // Return the updated invitation
  return acceptedInvitation;
}


