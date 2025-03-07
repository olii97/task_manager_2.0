
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

// The assistant ID to use
const ASSISTANT_ID = "asst_pEWgtxgc3knBhA0LXs0pgZYQ";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check for OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error("OpenAI API Key is missing");
      return new Response(
        JSON.stringify({ error: "OpenAI API Key is missing" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Important: Set the v2 header for all OpenAI API calls
    const openai = new OpenAI({
      apiKey: apiKey,
      baseOptions: {
        headers: {
          'OpenAI-Beta': 'assistants=v2' // Set assistants=v2 for v2 API
        }
      }
    })

    // Log that we're processing a request
    console.log("Processing OpenAI chat request");

    // Parse the request body
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, threadId, useAssistant, functionResults } = reqBody;

    console.log("Request parameters:", { 
      hasMessage: !!message, 
      threadId, 
      useAssistant, 
      hasFunctionResults: !!functionResults 
    });

    if (useAssistant) {
      // Assistant mode
      if (!threadId) {
        // Create a new thread with v2 API
        console.log("Creating a new thread with assistants=v2");
        try {
          const thread = await openai.beta.threads.create();
          console.log("Thread created successfully:", thread.id);
          return new Response(
            JSON.stringify({ 
              threadId: thread.id,
              assistantId: ASSISTANT_ID,
              model: "gpt-4o-mini"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error("Error creating thread:", error);
          return new Response(
            JSON.stringify({ error: `Error creating thread: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // If we have function results from a previous run, submit them
      if (functionResults) {
        console.log("Submitting function results for run:", functionResults.runId);
        try {
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
        } catch (error) {
          console.error("Error submitting function results:", error);
          return new Response(
            JSON.stringify({ error: `Error submitting function results: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Add the message to the thread
      if (message) {
        console.log("Adding message to thread:", threadId);
        try {
          await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
          })
        } catch (error) {
          console.error("Error adding message to thread:", error);
          return new Response(
            JSON.stringify({ error: `Error adding message to thread: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Run the assistant with function calling enabled
      console.log("Running assistant for thread:", threadId);
      let run;
      try {
        run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID,
          tools: [{ type: "function", function: functions[0] }]
        })
      } catch (error) {
        console.error("Error running assistant:", error);
        return new Response(
          JSON.stringify({ error: `Error running assistant: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Poll for the run completion
      console.log("Polling for run completion:", run.id);
      let runStatus;
      try {
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
        
        let attempts = 0;
        const maxAttempts = 30; // Prevent infinite looping
        
        while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
          console.log(`Run status (attempt ${attempts+1}/${maxAttempts}):`, runStatus.status);
          if (runStatus.status === 'failed') {
            throw new Error('Assistant run failed: ' + JSON.stringify(runStatus.last_error))
          }
          // Wait for a second before checking again
          await new Promise(resolve => setTimeout(resolve, 1000))
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
          attempts++;
        }
        
        if (attempts >= maxAttempts && (runStatus.status === 'in_progress' || runStatus.status === 'queued')) {
          throw new Error('Assistant run timed out after ' + maxAttempts + ' attempts')
        }
      } catch (error) {
        console.error("Error retrieving run status:", error);
        return new Response(
          JSON.stringify({ error: `Error retrieving run status: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if the run requires action (function calling)
      if (runStatus.status === 'requires_action') {
        console.log("Run requires action (function call)");
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
              assistantId: ASSISTANT_ID
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the messages
      console.log("Getting messages for thread:", threadId);
      let messageList;
      try {
        messageList = await openai.beta.threads.messages.list(threadId)
      } catch (error) {
        console.error("Error listing messages:", error);
        return new Response(
          JSON.stringify({ error: `Error listing messages: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the latest assistant message
      const assistantMessages = messageList.data.filter(msg => msg.role === 'assistant');
      let latestResponse = "No response from assistant.";
      
      if (assistantMessages.length > 0) {
        const latestMessage = assistantMessages[0];
        if (latestMessage.content && latestMessage.content.length > 0) {
          const textContent = latestMessage.content.find(content => content.type === 'text');
          if (textContent && 'text' in textContent && textContent.text.value) {
            latestResponse = textContent.text.value;
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          response: latestResponse,
          assistantInfo: {
            model: "gpt-4o-mini",
            assistantId: ASSISTANT_ID
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Standard ChatGPT mode
      console.log("Using standard chat completion");
      try {
        const messages = reqBody.messages || [];
        
        // If no messages are provided, create a default one
        const messagesArray = messages.length > 0 ? 
          messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content[0]
          })) : 
          [{ role: 'system', content: 'You are a helpful assistant.' }];
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messagesArray
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
      } catch (error) {
        console.error("Error creating chat completion:", error);
        return new Response(
          JSON.stringify({ error: `Error creating chat completion: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
