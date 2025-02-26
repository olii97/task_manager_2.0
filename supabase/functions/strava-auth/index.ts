
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/strava-auth`;

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      throw new Error('Missing Strava configuration');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // Handle GET requests (OAuth callback)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      
      if (!code) {
        throw new Error('No authorization code provided');
      }

      console.log('Exchanging code for tokens...');
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokenData = await tokenResponse.json();

      // Store tokens in Supabase
      await supabase
        .from('strava_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        });

      // Redirect back to the application
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': '/',
        },
      });
    }

    // Handle POST requests (API actions)
    if (req.method === 'POST') {
      const { action } = await req.json();
      console.log(`Processing ${action} for user ${user.id}`);

      if (action === "get_auth_url") {
        const scope = 'read,activity:read';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
        
        return new Response(JSON.stringify({ url: authUrl }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === "get_activities") {
        // Get stored tokens
        const { data: tokens, error: tokenError } = await supabase
          .from('strava_tokens')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (tokenError || !tokens) {
          throw new Error('No Strava tokens found');
        }

        // Check if token needs refresh
        if (new Date(tokens.expires_at) <= new Date()) {
          console.log('Refreshing token...');
          const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: STRAVA_CLIENT_ID,
              client_secret: STRAVA_CLIENT_SECRET,
              refresh_token: tokens.refresh_token,
              grant_type: 'refresh_token',
            }),
          });

          const refreshData = await refreshResponse.json();
          
          // Update tokens in database
          await supabase
            .from('strava_tokens')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token,
              expires_at: new Date(refreshData.expires_at * 1000).toISOString(),
            })
            .eq('user_id', user.id);
          
          tokens.access_token = refreshData.access_token;
        }

        // Fetch activities from Strava
        console.log('Fetching activities...');
        const activitiesResponse = await fetch(
          'https://www.strava.com/api/v3/athlete/activities?per_page=5',
          {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
          }
        );

        if (!activitiesResponse.ok) {
          throw new Error(`Strava API error: ${activitiesResponse.statusText}`);
        }

        const activities = await activitiesResponse.json();
        return new Response(JSON.stringify(activities), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      throw new Error('Invalid action');
    }

    throw new Error(`Method ${req.method} not allowed`);

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
