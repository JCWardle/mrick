import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import { acceptInvitation, InvitationError } from './partnerInvitations';

const PENDING_INVITATION_KEY = 'pending_partner_invitation';
const INVITATION_ACCEPTED_KEY = 'invitation_accepted_flag';

/**
 * Check if a URL is a deep link we handle (not a route)
 * This prevents Expo Router from trying to route these URLs
 */
export function isHandledDeepLink(url: string): boolean {
  return extractInvitationCode(url) !== null;
}

/**
 * Extract invitation code from deep link URL
 * Format: mrick://partner/invite/{code}
 * Normalizes code to uppercase to match database storage
 */
function extractInvitationCode(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    // Check if it's a partner invite link
    if (parsed.hostname === 'partner' && parsed.path === '/invite') {
      // Extract code from path segments
      const segments = parsed.pathSegments || [];
      if (segments.length > 0) {
        return segments[0].toUpperCase();
      }
    }
    // Alternative format: mrick://partner/invite/CODE
    const match = url.match(/partner\/invite\/([^/?]+)/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return null;
  } catch (error) {
    console.error('Error parsing deep link URL:', error);
    return null;
  }
}

/**
 * Handle partner invitation deep link
 */
export async function handleDeepLink(url: string): Promise<void> {
  const code = extractInvitationCode(url);
  if (!code) {
    // Not a partner invitation link, ignore
    return;
  }

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is authenticated, accept invitation immediately
    try {
      await acceptInvitation(code);
      // Set flag to indicate invitation was accepted (for UI feedback)
      await SecureStore.setItemAsync(INVITATION_ACCEPTED_KEY, 'true');
      // Profile will be refreshed automatically via useAuth hook
      console.log('Invitation accepted successfully');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      // Store error for UI to display
      if (error instanceof InvitationError) {
        await SecureStore.setItemAsync('invitation_error', error.code);
      }
    }
  } else {
    // User is not authenticated, store code for later
    try {
      await SecureStore.setItemAsync(PENDING_INVITATION_KEY, code);
      console.log('Pending invitation stored for later acceptance');
    } catch (error) {
      console.error('Error storing pending invitation:', error);
    }
  }
}

/**
 * Check if an invitation was just accepted (for UI feedback)
 */
export async function checkInvitationAccepted(): Promise<boolean> {
  try {
    const flag = await SecureStore.getItemAsync(INVITATION_ACCEPTED_KEY);
    if (flag === 'true') {
      // Clear the flag
      await SecureStore.deleteItemAsync(INVITATION_ACCEPTED_KEY);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if there's a pending invitation without clearing it
 */
export async function hasPendingInvitation(): Promise<boolean> {
  try {
    const code = await SecureStore.getItemAsync(PENDING_INVITATION_KEY);
    return code !== null;
  } catch (error) {
    console.error('Error checking pending invitation:', error);
    return false;
  }
}

/**
 * Get and clear pending invitation from SecureStore
 */
export async function getPendingInvitation(): Promise<string | null> {
  try {
    const code = await SecureStore.getItemAsync(PENDING_INVITATION_KEY);
    if (code) {
      // Clear it after reading
      await SecureStore.deleteItemAsync(PENDING_INVITATION_KEY);
    }
    return code;
  } catch (error) {
    console.error('Error getting pending invitation:', error);
    return null;
  }
}

