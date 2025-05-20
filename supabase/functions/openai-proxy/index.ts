import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

console.log("OpenAI Proxy Edge Function Initialized");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("User auth error:", userError?.message);
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid token'}` }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("User authenticated:", user.id);

    // Ensure request body is JSON
    const { prompt, model = "gpt-3.5-turbo-1106", max_tokens = 300, temperature = 0.5 } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`User ${user.id} sent prompt: ${prompt}, model: ${model}`);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a task parsing assistant. Extract task information from the user input and respond ONLY with a JSON object with the following properties:\n- title: A concise task title\n- description: Additional details about the task\n- priority: A number from 1-4 (1=urgent, 4=low)\n- energy_level: 'high' or 'low'\n- category: One of ['Consume', 'Create', 'Care', 'Connect']\n- task_type: 'work' or 'personal'\n\nRespond ONLY with the JSON object, no explanations or additional text."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: max_tokens,
      temperature: temperature,
      response_format: { type: "json_object" }
    });

    console.log("OpenAI API call successful for user:", user.id);

    // The direct response from OpenAI is completion.choices[0].message, 
    // which is an object like { role: 'assistant', content: '...' }
    // We'll return this entire message object.
    return new Response(
      JSON.stringify(completion.choices[0].message),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in OpenAI Proxy Edge Function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}); 