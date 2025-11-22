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
    return activeInvitation;
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
 */
export async function getInvitationByCode(code: string): Promise<PartnerInvitation | null> {
  const { data, error } = await supabase.rpc('get_invitation_by_code', {
    invitation_code: code,
  });

  if (error) {
    // If function doesn't exist yet (migration not run), fall back to direct query
    // This is a temporary fallback for development
    if (error.code === '42883') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('code', code)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fallbackError) {
        if (fallbackError.code === 'PGRST116') {
          return null; // Not found
        }
        throw new InvitationError(
          `Failed to lookup invitation: ${fallbackError.message}`,
          'NETWORK_ERROR'
        );
      }

      return fallbackData;
    }

    throw new InvitationError(
      `Failed to lookup invitation: ${error.message}`,
      'NETWORK_ERROR'
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  // RPC function returns array, get first result
  return Array.isArray(data) ? data[0] : data;
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
 */
export async function acceptInvitation(code: string): Promise<PartnerInvitation> {
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

  // Get invitation by code
  const invitation = await getInvitationByCode(code);
  if (!invitation) {
    throw new InvitationError(
      'Invitation not found or has expired',
      'NOT_FOUND'
    );
  }

  // Check if expired
  if (new Date(invitation.expires_at) <= new Date()) {
    throw new InvitationError(
      'This invitation has expired',
      'EXPIRED'
    );
  }

  // Check if already used
  if (invitation.used_at) {
    throw new InvitationError(
      'This invitation has already been used',
      'ALREADY_USED'
    );
  }

  // Prevent self-invite
  if (invitation.inviter_id === user.id) {
    throw new InvitationError(
      'You cannot accept your own invitation',
      'SELF_INVITE'
    );
  }

  // Update invitation to accept it
  const { data, error } = await supabase
    .from('partner_invitations')
    .update({
      invitee_id: user.id,
      used_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)
    .select()
    .single();

  if (error) {
    throw new InvitationError(
      `Failed to accept invitation: ${error.message}`,
      'NETWORK_ERROR'
    );
  }

  // The database trigger will automatically link partners
  // Return the updated invitation
  return data;
}

