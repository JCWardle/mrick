<!-- 7e6767db-3013-4037-b3d5-77f38bbf05fe 56ed904e-a3b1-406f-8756-9a64e4cf4479 -->
# Partner Invitation Feature Implementation

## Overview

Implement a complete partner invitation system that allows users to invite their partner via QR codes and deep links. The feature includes invitation generation, QR code display, deep link handling, and automatic partner linking.

## Implementation Steps

### 1. Fix RLS Security Issue (Database Migration)

Create migration to fix overly permissive RLS policy:

- Remove or restrict the "Users can view unused invitations for acceptance" policy that allows querying all unused invitations
- Create a secure database function `get_invitation_by_code(code TEXT)` that allows lookup by code only
- Function should use SECURITY DEFINER to bypass RLS for the lookup, but only return the invitation if it's unused and not expired
- Update RLS policies to prevent bulk export of invitation codes
- Ensure users can only query invitations they created or look up by specific code via the secure function

### 2. Create Partner Invitations Library (`lib/partnerInvitations.ts`)

Create functions to manage partner invitations:

- `generateInvitationCode()`: Generate unique 6-8 character alphanumeric code
- `createInvitation()`: Create invitation in database with 24-hour expiration
- `acceptInvitation(code: string)`: Accept invitation by code (sets invitee_id and used_at)
- `getInvitationByCode(code: string)`: Lookup invitation for validation (use secure RPC function)
- `getActiveInvitation()`: Get user's active (unused, unexpired) invitation (filtered by inviter_id)
- Error handling for expired, used, self-invite, and already-linked cases

### 2. Update PartnerInviteModal Component (`components/partner/PartnerInviteModal.tsx`)

Replace stub implementation with full modal:

- Title: "Invite your playmate"
- QR code display using `react-native-qrcode-svg` (200x200px minimum)
- QR code contains deep link: `mrick://partner/invite/{code}`
- Copy link button that copies full deep link to clipboard
- Toast/snackbar feedback for "Link copied!"
- Dismiss functionality (tap outside or close button)
- Styling: centered modal, white background, rounded corners, proper padding
- Handle loading state while generating invitation

### 3. Integrate Modal into Matching Screen (`app/(swipe)/matching.tsx`)

Add invitation modal logic:

- Use `useAuth` hook to get current profile
- Check if `profile.partner_id` is null when screen loads/focuses
- If no partner, automatically show `PartnerInviteModal`
- Generate invitation when modal opens (call `createInvitation()`)
- Pass invitation code to modal for QR generation
- Handle modal dismissal

### 4. Set Up Deep Link Handling

Add deep link listener in `app/_layout.tsx` or create dedicated handler:

- Use `expo-linking` to listen for `mrick://partner/invite/{code}` URLs
- Extract invitation code from URL path
- If user is authenticated: immediately call `acceptInvitation(code)`
- If user is not authenticated: store code in SecureStore with key `pending_partner_invitation`
- Handle app launch from deep link (initial URL)

### 5. Auto-Accept Pending Invitations

Update authentication flow to check for pending invitations:

- In `app/(auth)/login.tsx`: After successful login, check SecureStore for `pending_partner_invitation`
- In `app/(auth)/signup.tsx`: After successful signup, check SecureStore for `pending_partner_invitation`
- If found, call `acceptInvitation(code)` and clear from SecureStore
- After acceptance, refresh profile to get updated `partner_id`
- Show success message: "You're now linked with [Partner Name]!" (fetch partner name from profile)
- Redirect to matching screen or swipe screen

### 6. Error Handling and User Feedback

Implement error handling throughout:

- Expired invitation: Show "This invitation has expired" message
- Already used: Show "This invitation has already been used" message
- Self-invite: Prevent users from accepting their own invitation (check in `acceptInvitation`)
- Already linked: Show "You're already linked with a partner" message
- Network errors: Show appropriate error messages
- Use react-native-paper Snackbar or similar for user feedback

### 7. Update useAuth Hook (if needed)

Ensure `refreshProfile()` is called after invitation acceptance to update `partner_id` in auth state.

## Technical Details

### Deep Link Format

- Pattern: `mrick://partner/invite/{code}`
- Example: `mrick://partner/invite/ABC123`

### SecureStore Keys

- `pending_partner_invitation`: Stores invitation code when user scans before login

### Database Integration

- Leverage existing `partner_invitations` table
- Use existing `link_partners()` trigger for automatic partner linking
- Invitation expires after 24 hours (`expires_at` field)

### Dependencies

- `react-native-qrcode-svg`: Already installed
- `expo-linking`: Already installed  
- `expo-secure-store`: Already installed

## Files to Create/Modify

**New Files:**

- `lib/partnerInvitations.ts`

**Modified Files:**

- `components/partner/PartnerInviteModal.tsx`
- `app/(swipe)/matching.tsx`
- `app/_layout.tsx` (or create separate deep link handler)
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`
- `app/index.tsx` (may need deep link handling on app launch)

## Testing Considerations

- Test QR code generation and scanning
- Test deep link handling when app is closed, backgrounded, and open
- Test invitation acceptance flow for all three scenarios (app not installed, not logged in, logged in)
- Test error cases (expired, used, self-invite, already linked)
- Test modal appears/disappears correctly on Matching screen
- Test partner linking works bidirectionally