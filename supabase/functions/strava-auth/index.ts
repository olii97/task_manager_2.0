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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/strava-auth`;

    console.log("Function triggered, method:", req.method);
    console.log("SUPABASE_URL:", SUPABASE_URL);
    console.log("REDIRECT_URI:", REDIRECT_URI);

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      console.error("Missing Strava environment variables");
      throw new Error('Missing Strava configuration');
    }

    // Initialize Supabase client with service role key for the callback flow
    // This allows us to write to the database without a user JWT
    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Handle GET requests (OAuth callback)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const state = url.searchParams.get('state');
      
      console.log("Callback received with:", { code: !!code, error, state });
      
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
      
      const userId = state;
      console.log('User ID from state:', userId);
      
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
        const errorText = await tokenResponse.text();
        console.error('Strava token exchange failed:', errorText);
        return new Response(
          `<html><body><h1>Token Exchange Failed</h1><p>Failed to exchange code for tokens: ${errorText}</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful, access token retrieved');

      console.log("Storing tokens for user:", userId);

      const { error: upsertError } = await adminSupabase
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
          `<html><body><h1>Token Storage Failed</h1><p>Failed to store tokens: ${upsertError.message}</p><p><a href="/">Return to app</a></p></body></html>`,
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'text/html'
            }
          }
        );
      }

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
        console.log("Received request body:", JSON.stringify(requestBody));
      } catch (e) {
        console.error("Failed to parse request body:", e);
        return new Response(JSON.stringify({ error: "Invalid request body" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const { action, userId } = requestBody;
      console.log("Action requested:", action);
      console.log("User ID received:", userId);
      
      if (action === "get_auth_url") {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          console.error("Missing authorization header");
          return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          console.error('User auth error:', userError);
          return new Response(JSON.stringify({ error: 'Invalid user' }), { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const state = user.id;
        const scope = 'read,activity:read';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}&state=${state}`;
        
        console.log("Generated auth URL:", authUrl);
        
        return new Response(JSON.stringify({ url: authUrl }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === "get_activities") {
        if (!userId) {
          console.error("get_activities: No user ID provided in request body");
          return new Response(JSON.stringify({ error: 'User ID is required' }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log(`Processing get_activities for user ${userId}`);
        
        const { data: tokens, error: tokenError } = await adminSupabase
          .from('strava_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (tokenError) {
          console.error('No Strava tokens found:', tokenError);
          return new Response(JSON.stringify({ error: 'No Strava tokens found for this user', details: tokenError }), { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!tokens) {
          console.error('No tokens found for user:', userId);
          return new Response(JSON.stringify({ error: 'User not connected to Strava' }), { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const now = Math.floor(Date.now() / 1000);
        console.log(`Current time: ${now}, Token expires at: ${tokens.expires_at}`);
        
        if (tokens.expires_at <= now) {
          console.log('Refreshing token...');
          try {
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
              const errorText = await refreshResponse.text();
              console.error('Token refresh failed:', errorText);
              return new Response(JSON.stringify({ error: `Failed to refresh token: ${errorText}` }), { 
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }

            const refreshData = await refreshResponse.json();
            console.log('Token refreshed successfully');
            
            await adminSupabase
              .from('strava_tokens')
              .update({
                access_token: refreshData.access_token,
                refresh_token: refreshData.refresh_token,
                expires_at: refreshData.expires_at,
              })
              .eq('user_id', userId);
            
            tokens.access_token = refreshData.access_token;
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            return new Response(JSON.stringify({ error: `Error refreshing token: ${refreshError.message}` }), { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        console.log('Fetching activities with token...');
        try {
          const activitiesResponse = await fetch(
            'https://www.strava.com/api/v3/athlete/activities?per_page=5',
            {
              headers: { 'Authorization': `Bearer ${tokens.access_token}` },
            }
          );

          console.log('Strava API response status:', activitiesResponse.status);
          
          if (!activitiesResponse.ok) {
            const errorText = await activitiesResponse.text();
            console.error('Activities fetch failed:', errorText);
            return new Response(JSON.stringify({ error: `Strava API error: ${activitiesResponse.statusText} - ${errorText}` }), { 
              status: activitiesResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const activities = await activitiesResponse.json();
          console.log(`Fetched ${activities.length} activities`);
          
          return new Response(JSON.stringify(activities), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (fetchError) {
          console.error('Activities fetch error:', fetchError);
          return new Response(JSON.stringify({ error: `Error fetching activities: ${fetchError.message}` }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: `Method ${req.method} not allowed` }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
