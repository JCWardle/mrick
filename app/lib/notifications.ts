import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { getProfile } from './profiles';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E6F4FE',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get Expo push token and save it to the user's profile
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Expo will use the project ID from app.json
    });

    const token = tokenData.data;

    // Save token to user's profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        // Ensure profile exists first
        const profile = await getProfile();
        if (!profile) {
          console.warn('Profile does not exist, cannot save push token');
          return token;
        }

        // Update profile with push token
        const { error } = await supabase
          .from('profiles')
          .update({ expo_push_token: token })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving push token:', error);
        } else {
          console.log('Push token saved successfully');
        }
      } catch (error) {
        console.error('Error updating profile with push token:', error);
      }
    }

    return token;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Send a local notification (for testing)
 */
export async function sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

/**
 * Setup notification handlers for received and opened notifications
 */
export function setupNotificationHandlers(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationOpened?: (notification: Notifications.NotificationResponse) => void
): () => void {
  // Handle notifications received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Handle notifications that open the app (tapped)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification opened:', response);
    onNotificationOpened?.(response);
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Check if both partners have completed swiping and send notification if needed
 */
export async function checkAndNotifyCompletion(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user authenticated, skipping completion check');
      return;
    }

    // Check if both partners have completed
    const { data: bothCompleted, error: checkError } = await supabase.rpc(
      'check_both_partners_completed',
      { user_uuid: user.id }
    );

    if (checkError) {
      console.error('Error checking completion status:', checkError);
      return;
    }

    if (!bothCompleted) {
      console.log('Both partners have not completed swiping yet');
      return;
    }

    // Check if notification has already been sent
    const { data: alreadySent, error: sentError } = await supabase.rpc(
      'has_completion_notification_been_sent',
      { user_uuid: user.id }
    );

    if (sentError) {
      console.error('Error checking if notification was sent:', sentError);
      return;
    }

    if (alreadySent) {
      console.log('Completion notification already sent');
      return;
    }

    // Get partner info
    const profile = await getProfile();
    if (!profile?.partner_id) {
      console.log('No partner linked');
      return;
    }

    // Get partner's profile to get their name (if available)
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profile.partner_id)
      .single();

    if (!partnerProfile) {
      console.log('Partner profile not found');
      return;
    }

    // Call Edge Function to send push notifications to both users
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
      'send-completion-notification',
      {
        body: {
          user1_id: user.id,
          user2_id: profile.partner_id,
        },
      }
    );

    if (edgeFunctionError) {
      console.error('Error calling Edge Function:', edgeFunctionError);
      // Fallback: mark as sent anyway to prevent retry loops
      await supabase.rpc('mark_completion_notification_sent', {
        user1_uuid: user.id,
        user2_uuid: profile.partner_id,
      });
      return;
    }

    console.log('Completion notification sent successfully');
  } catch (error) {
    console.error('Error in checkAndNotifyCompletion:', error);
    // Don't throw - this should not block the swipe save
  }
}

/**
 * Initialize notifications for the app
 * Should be called on app startup after user is authenticated
 */
export async function initializeNotifications(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user authenticated, skipping notification initialization');
      return;
    }

    // Request permissions and get push token
    await getExpoPushToken();
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

