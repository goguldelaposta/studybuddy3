import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    if (action === 'subscribe') {
      // Register push subscription
      const subscription: PushSubscription = await req.json();
      
      if (!subscription.endpoint || !subscription.keys) {
        throw new Error('Invalid subscription data');
      }

      // Store subscription (would need a push_subscriptions table)
      console.log(`Push subscription registered for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription registered. Note: Full push notification support requires VAPID keys setup.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send') {
      // Send notification (admin only)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: roles } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin');
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      const { targetUserId, notification } = await req.json() as {
        targetUserId?: string;
        notification: NotificationPayload;
      };

      console.log(`Push notification queued: "${notification.title}" for ${targetUserId || 'all users'}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification queued. Note: Full push notification support requires VAPID keys and subscription storage.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'vapid-public-key') {
      // Return VAPID public key for client subscription
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      
      if (!vapidPublicKey) {
        return new Response(
          JSON.stringify({ 
            error: 'VAPID keys not configured',
            message: 'Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets to enable push notifications.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      return new Response(
        JSON.stringify({ publicKey: vapidPublicKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Unknown action');
  } catch (error: unknown) {
    console.error('Error in push notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
