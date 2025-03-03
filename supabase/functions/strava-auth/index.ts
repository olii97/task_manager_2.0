
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

    console.log("Function triggered, method:", req.method);
    console.log("SUPABASE_URL:", SUPABASE_URL);
    console.log("REDIRECT_URI:", REDIRECT_URI);

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      console.error("Missing Strava environment variables");
      throw new Error('Missing Strava configuration');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Handle GET requests (OAuth callback)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const state = url.searchParams.get('state');
      
      if (error) {
        console.error("Strava auth error:", error);
        return new Response(
          `<html><body><h1>Authentication Failed</h1><p>Strava authentication error: ${error}</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }
      
      if (!code) {
        console.error("No authorization code provided");
        return new Response(
          `<html><body><h1>Missing Code</h1><p>No authorization code was provided</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }
      
      // Get user_id from state parameter
      if (!state) {
        console.error("No state parameter provided");
        return new Response(
          `<html><body><h1>Missing State</h1><p>No state parameter was provided</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
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

      const responseText = await tokenResponse.text();
      console.log("Token response status:", tokenResponse.status);
      console.log("Token response:", responseText);

      if (!tokenResponse.ok) {
        console.error('Strava token exchange failed:', responseText);
        return new Response(
          `<html><body><h1>Token Exchange Failed</h1><p>Failed to exchange code for tokens. Please try again.</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }

      const tokenData = JSON.parse(responseText);
      console.log('Token exchange successful, access token length:', tokenData.access_token?.length);

      // Store tokens in Supabase using the user_id from state
      const userId = state;
      console.log("Storing tokens for user:", userId);

      const { error: upsertError } = await supabase
        .from('strava_tokens')
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
        });

      if (upsertError) {
        console.error('Token storage error:', upsertError);
        return new Response(
          `<html><body><h1>Token Storage Failed</h1><p>Failed to store tokens. Please try again.</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }

      // Redirect back to the application
      return new Response(
        `<html><body><h1>Authentication Successful</h1><p>Your Strava account has been connected!</p><script>window.location.href = "/";</script><p>If you're not redirected automatically, <a href="/">click here</a></p></body></html>`,
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html'
          },
        }
      );
    }

    // Handle POST requests (API actions)
    if (req.method === 'POST') {
      let requestBody;
      try {
        requestBody = await req.json();
      } catch (e) {
        console.error("Failed to parse request body:", e);
        throw new Error("Invalid request body");
      }
      
      const { action } = requestBody;
      console.log("Action requested:", action);
      
      // Get user from Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error("Missing authorization header");
        throw new Error('Missing authorization header');
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error('User auth error:', userError);
        throw new Error('Invalid user');
      }

      console.log(`Processing ${action} for user ${user.id}`);

      if (action === "get_auth_url") {
        // Use user.id as the state parameter
        const state = user.id;
        const scope = 'read,activity:read';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}&state=${state}`;
        
        console.log("Generated auth URL:", authUrl);
        
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
          console.error('No Strava tokens found:', tokenError);
          throw new Error('No Strava tokens found');
        }

        // Check if token needs refresh
        const now = Math.floor(Date.now() / 1000);
        if (tokens.expires_at <= now) {
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

          if (!refreshResponse.ok) {
            const errorData = await refreshResponse.text();
            console.error('Token refresh failed:', errorData);
            throw new Error('Failed to refresh token');
          }

          const refreshData = await refreshResponse.json();
          console.log('Token refreshed successfully');
          
          // Update tokens in database
          await supabase
            .from('strava_tokens')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token,
              expires_at: refreshData.expires_at,
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
          const errorData = await activitiesResponse.text();
          console.error('Activities fetch failed:', errorData);
          throw new Error(`Strava API error: ${activitiesResponse.statusText}`);
        }

        const activities = await activitiesResponse.json();
        console.log(`Fetched ${activities.length} activities`);
        
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
