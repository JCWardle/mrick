// Supabase Edge Function to send push notifications when both partners complete swiping
// This function is called from the client after detecting both partners have completed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

interface RequestBody {
  user1_id: string;
  user2_id: string;
}

interface ExpoPushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body: RequestBody = await req.json();
    const { user1_id, user2_id } = body;

    if (!user1_id || !user2_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user1_id or user2_id' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Verify the caller is one of the users (using auth header)
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (user.id !== user1_id && user.id !== user2_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: can only send notifications for your own partnership' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Fetch push tokens for both users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .in('id', [user1_id, user2_id]);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profiles' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get partner names for personalized messages
    const user1Profile = profiles?.find(p => p.id === user1_id);
    const user2Profile = profiles?.find(p => p.id === user2_id);

    // Filter out users without push tokens
    const tokensToNotify: Array<{ userId: string; token: string; partnerName: string }> = [];
    
    if (user1Profile?.expo_push_token) {
      tokensToNotify.push({
        userId: user1_id,
        token: user1Profile.expo_push_token,
        partnerName: 'your partner', // Could be enhanced to get actual name
      });
    }

    if (user2Profile?.expo_push_token) {
      tokensToNotify.push({
        userId: user2_id,
        token: user2Profile.expo_push_token,
        partnerName: 'your partner', // Could be enhanced to get actual name
      });
    }

    if (tokensToNotify.length === 0) {
      // No tokens available, but mark as sent anyway
      await supabase.rpc('mark_completion_notification_sent', {
        user1_uuid: user1_id,
        user2_uuid: user2_id,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No push tokens available, notification marked as sent' 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Prepare push messages
    const messages: ExpoPushMessage[] = tokensToNotify.map(({ token, partnerName }) => ({
      to: token,
      sound: 'default',
      title: "You're both done!",
      body: `You and ${partnerName} have finished swiping. Check your matches now!`,
      data: {
        type: 'swipe_completion',
        screen: 'matching',
      },
    }));

    // Send push notifications via Expo API
    const pushResponse = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    if (!pushResponse.ok) {
      const errorText = await pushResponse.text();
      console.error('Expo push API error:', errorText);
      
      // Mark as sent anyway to prevent retry loops
      await supabase.rpc('mark_completion_notification_sent', {
        user1_uuid: user1_id,
        user2_uuid: user2_id,
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send push notifications',
          details: errorText 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const pushResult = await pushResponse.json();
    console.log('Push notifications sent:', pushResult);

    // Mark notification as sent in database
    const { error: markError } = await supabase.rpc('mark_completion_notification_sent', {
      user1_uuid: user1_id,
      user2_uuid: user2_id,
    });

    if (markError) {
      console.error('Error marking notification as sent:', markError);
      // Don't fail the request, notification was sent
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        pushResult 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-completion-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

