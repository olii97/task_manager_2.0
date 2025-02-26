
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
    })

    const { messages, threadId } = await req.json()

    if (!threadId) {
      // Create a new thread
      const thread = await openai.beta.threads.create()
      return new Response(
        JSON.stringify({ threadId: thread.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add the message to the thread
    if (messages?.length > 0) {
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messages[messages.length - 1].content,
      })
    }

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: 'asst_2LtO43entDi3setFlbgvsoM5',
    })

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
    }

    // Get the messages
    const messageList = await openai.beta.threads.messages.list(threadId)
    
    return new Response(
      JSON.stringify({ messages: messageList.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
