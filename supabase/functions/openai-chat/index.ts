
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define the function schema for adding tasks
const functions = [
  {
    name: "add_task",
    description: "Add a task to the user's task list",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the task",
        },
        description: {
          type: "string", 
          description: "Optional description of the task",
        },
        priority: {
          type: "integer",
          description: "Priority level from 1 (highest) to 4 (lowest)",
          enum: [1, 2, 3, 4]
        },
        is_scheduled_today: {
          type: "boolean",
          description: "Whether the task should be scheduled for today or just added to the backlog"
        },
        energy_level: {
          type: "string",
          description: "Energy level required for the task: high or low",
          enum: ["high", "low"]
        }
      },
      required: ["title"]
    }
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Log the API key existence (not the actual key) for debugging
    console.log("OpenAI API Key exists:", !!Deno.env.get('OPENAI_API_KEY'))

    const { messages, threadId, useAssistant, functionResults } = await req.json()

    if (useAssistant) {
      // Assistant mode
      if (!threadId) {
        // Create a new thread
        const thread = await openai.beta.threads.create()
        return new Response(
          JSON.stringify({ 
            threadId: thread.id,
            messages: [],
            assistantInfo: {
              model: "gpt-4o-mini",
              assistantId: "asst_2LtO43entDi3setFlbgvsoM5"
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If we have function results from a previous run, submit them
      if (functionResults) {
        await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          functionResults.runId,
          {
            tool_outputs: [
              {
                tool_call_id: functionResults.toolCallId,
                output: JSON.stringify({ success: true, message: "Task added successfully" }),
              },
            ],
          }
        );
      }

      // Add the message to the thread
      if (messages?.length > 0) {
        const lastMessage = messages[messages.length - 1]
        await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: lastMessage.content[0],
        })
      }

      // Run the assistant with function calling enabled
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: 'asst_2LtO43entDi3setFlbgvsoM5',
        tools: [{ type: "function", function: functions[0] }]
      })

      // Poll for the run completion
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
      
      while (runStatus.status !== 'completed' && runStatus.status !== 'requires_action') {
        if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed: ' + JSON.stringify(runStatus.last_error))
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
      }

      // Check if the run requires action (function calling)
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs.tool_calls || []
        
        // We'll return the function call information to the client
        return new Response(
          JSON.stringify({ 
            functionCall: {
              runId: run.id,
              toolCallId: toolCalls[0].id,
              name: toolCalls[0].function.name,
              arguments: JSON.parse(toolCalls[0].function.arguments)
            },
            assistantInfo: {
              model: "gpt-4o-mini",
              assistantId: "asst_2LtO43entDi3setFlbgvsoM5"
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the messages
      const messageList = await openai.beta.threads.messages.list(threadId)
      
      return new Response(
        JSON.stringify({ 
          messages: messageList.data,
          assistantInfo: {
            model: "gpt-4o-mini",
            assistantId: "asst_2LtO43entDi3setFlbgvsoM5"
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Standard ChatGPT mode
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content[0]
        }))
      })

      return new Response(
        JSON.stringify({ 
          messages: [{
            role: 'assistant',
            content: [completion.choices[0].message.content]
          }],
          assistantInfo: {
            model: "gpt-4o-mini"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
