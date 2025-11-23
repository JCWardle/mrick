# Partner Invitation Feature

## Overview
A low-friction way for users to invite their partner to link accounts and compare preferences. The ideal experience uses QR codes for maximum convenience.

## Trigger Behavior

The invitation modal appears when:
- User navigates to the **Matching** screen (taps the partner icon in bottom navigation)
- **AND** the user has no linked partner (`partner_id` is null in their profile)

**Note**: The modal does NOT appear automatically during swiping. It only appears when the user actively navigates to the Matching screen and has no partner.

## User Flow

### Inviter (User A - Logged In)
1. User A navigates to the **Matching** screen (partner menu item in bottom navigation)
2. If User A has **no linked partner** (`partner_id` is null), the invitation modal automatically appears
3. Modal shows:
   - **Title**: "Invite your playmate"
   - **QR Code**: Displays the deep link `mrick://partner/invite/{code}` as a scannable QR code
   - **Copy Link Button**: Copies the deep link to clipboard (e.g., `mrick://partner/invite/ABC123`)
   - Modal can be dismissed by tapping outside or using a close button
4. User A holds phone for partner to scan QR code, or shares the copied link

### Invitee (User B - Scanning QR Code)
**Scenario 1: App Not Installed**
- QR code opens App Store/Play Store
- After installation, deep link is handled on first launch
- User B signs up/logs in → invitation auto-accepted

**Scenario 2: App Installed, Not Logged In**
- Deep link opens app → redirects to signup/login screen
- Invitation code stored in AsyncStorage/SecureStore
- After successful authentication → auto-accept invitation
- Redirect to onboarding (if needed) or swipe screen

**Scenario 3: App Installed, Already Logged In**
- Deep link opens app → immediately accepts invitation
- Show success message: "You're now linked with [Partner Name]!"
- Redirect to matching/comparison screen

## Technical Implementation

### Deep Link Format
```
mrick://partner/invite/{code}
```

### Database Flow
1. **Create Invitation**: User A generates unique code (6-8 alphanumeric characters)
2. **Store Invitation**: Saved in `partner_invitations` table with:
   - `code`: Unique invitation code
   - `inviter_id`: User A's profile ID
   - `expires_at`: 24 hours from creation
   - `used_at`: NULL until accepted
3. **Accept Invitation**: User B scans code → updates invitation with:
   - `invitee_id`: User B's profile ID
   - `used_at`: Current timestamp
4. **Auto-Link Partners**: Database trigger automatically:
   - Sets `partner_id` on User A's profile → User B's ID
   - Sets `partner_id` on User B's profile → User A's ID

### State Management
- **Pending Invitation**: Stored in SecureStore when user scans QR before login
- **Invitation Code**: Passed via URL params in deep link
- **Modal Trigger**: Check `partner_id` on profile when navigating to Matching screen
- **Invitation Generation**: Create invitation when modal opens (if none exists or previous expired)

### Error Handling
- **Expired Code**: Show "This invitation has expired" message
- **Already Used**: Show "This invitation has already been used" message
- **Self-Invite**: Prevent users from accepting their own invitation
- **Already Linked**: Show "You're already linked with a partner" message

## UI Design

### Invitation Modal
A simple, clean modal with minimal elements:

**Layout:**
- Centered modal with rounded corners
- White/light background with app's gradient background visible behind
- Padding for comfortable viewing

**Content:**
1. **Title**: "Invite your playmate" 
   - Large, readable text
   - Centered at top of modal

2. **QR Code**
   - Large, prominent QR code (minimum 200x200px for easy scanning)
   - Centered in modal
   - Contains deep link: `mrick://partner/invite/{code}`
   - White background with black QR pattern for maximum contrast

3. **Copy Link Button**
   - Below QR code
   - Copies full deep link to clipboard: `mrick://partner/invite/{code}`
   - Shows confirmation feedback (e.g., "Link copied!" toast/snackbar)
   - Styled to match app's button design

**Dismissal:**
- Tap outside modal to close
- Optional: Close/X button in top-right corner

## UX Considerations

### Lowest Friction Approach
1. **QR Code First**: Most convenient for in-person sharing
2. **Deep Link Copy**: Simple clipboard copy for sharing via text/email/etc.
3. **Auto-Accept**: No manual "accept" button needed - happens automatically
4. **Clear Feedback**: Success/error messages at each step
5. **No Account Required Initially**: Partner can scan QR before signing up
6. **On-Demand Access**: Modal appears when user actively seeks partner linking (via Matching screen)

### Privacy & Security
- Invitation codes expire after 24 hours
- Codes are single-use only
- No personal information exposed in QR code
- Partners must authenticate before linking

## Implementation Checklist

- [x] Database schema (already exists)
- [ ] `lib/partnerInvitations.ts` - Create/accept invitation functions
- [ ] `PartnerInviteModal` - Simple modal with:
  - Title: "Invite your playmate"
  - QR code display (using `react-native-qrcode-svg`)
  - Copy link button (copies `mrick://partner/invite/{code}` to clipboard)
  - Dismiss functionality
- [ ] Deep link handler in `app/_layout.tsx` or `app/index.tsx`
- [ ] Pending invitation storage (SecureStore)
- [ ] Auto-accept on login/signup completion
- [ ] Integration with Matching screen:
  - Check if user has `partner_id` when screen loads
  - If no partner, show invitation modal
  - Generate invitation code when modal opens
- [ ] Error handling and user feedback
- [ ] Success screen after linking

