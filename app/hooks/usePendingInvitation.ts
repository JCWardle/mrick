import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { getPendingInvitation } from '../lib/deepLinkHandler';
import { acceptInvitation, InvitationError } from '../lib/partnerInvitations';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

/**
 * Hook to handle pending partner invitations after authentication
 */
export function usePendingInvitation() {
  const { isAuthenticated, refreshProfile } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isProcessing) return;

    const processPendingInvitation = async () => {
      setIsProcessing(true);
      try {
        const code = await getPendingInvitation();
        if (!code) {
          setIsProcessing(false);
          return;
        }

        // Accept the invitation
        try {
          await acceptInvitation(code);
          
          // Refresh profile to get updated partner_id
          await refreshProfile();

          // Get partner's name for success message
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('partner_id')
              .eq('id', user.id)
              .single();

            if (profile?.partner_id) {
              const { data: partnerProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', profile.partner_id)
                .single();

              // Show success message
              Alert.alert(
                'Partner Linked!',
                "You're now linked with your partner!",
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to matching screen
                      router.replace('/(swipe)/matching');
                    },
                  },
                ]
              );
            }
          }
        } catch (error: any) {
          // Handle invitation errors
          let message = 'Failed to accept invitation';
          if (error instanceof InvitationError) {
            switch (error.code) {
              case 'EXPIRED':
                message = 'This invitation has expired';
                break;
              case 'ALREADY_USED':
                message = 'This invitation has already been used';
                break;
              case 'SELF_INVITE':
                message = 'You cannot accept your own invitation';
                break;
              case 'ALREADY_LINKED':
                message = 'You are already linked with a partner';
                break;
              case 'NOT_FOUND':
                message = 'Invitation not found';
                break;
              default:
                message = error.message || message;
            }
          } else {
            message = error.message || message;
          }

          Alert.alert('Invitation Error', message, [{ text: 'OK' }]);
        }
      } catch (error: any) {
        console.error('Error processing pending invitation:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure auth state is fully settled
    const timer = setTimeout(() => {
      processPendingInvitation();
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isProcessing, refreshProfile, router]);

  return { isProcessing };
}

