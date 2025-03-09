import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import OpenAI from "https://deno.land/x/openai@v4.26.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define the v2 tool resources configuration
const tool_resources = {
  file_search: {
    vector_store_ids: [] // Empty array instead of 'enabled: true'
  }
};

// Assistant configuration with v2 tool resources
const assistantConfig = {
  name: "Task Management Assistant",
  instructions: "You are a helpful task management assistant. Help users organize and manage their tasks effectively.",
  model: "gpt-4o-mini",
  tools: [
    { type: "function", function: {
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
    }},
    { type: "file_search" }
  ],
  tool_resources: tool_resources
};

// Fixed assistant ID to use for all users
const FIXED_ASSISTANT_ID = "asst_DOAXZQD6pbB5wS27NxnOAOi9";

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

    // Create OpenAI client with v2 header for ALL requests
    const openai = new OpenAI({
      apiKey: apiKey,
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2' // Use defaultHeaders to apply to all API calls
      },
      defaultQuery: {
        'assistants_version': 'v2' // Add this as well to ensure v2 is used
      }
    });

    console.log("OpenAI client created with headers:", {
      'OpenAI-Beta': 'assistants=v2',
      'assistants_version': 'v2'
    });

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

    const { message, threadId, useAssistant, functionResults, assistantId } = reqBody;

    console.log("Request parameters:", { 
      hasMessage: !!message, 
      threadId, 
      useAssistant: !!useAssistant,
      assistantId,
      hasFunctionResults: !!functionResults,
      checkStatus: !!reqBody.checkStatus,
      getMessages: !!reqBody.getMessages,
      runId: reqBody.runId,
      reuseThread: !!reqBody.reuseThread
    });

    // Always use the fixed assistant ID
    const assistantIdToUse = FIXED_ASSISTANT_ID;
    console.log("Using fixed assistant ID:", assistantIdToUse);

    if (useAssistant === true) {
      console.log("Entering assistant mode with fixed assistant ID:", FIXED_ASSISTANT_ID);

      // Check if we want to reuse a thread and the thread exists
      if (threadId && reqBody.reuseThread) {
        console.log("Reusing existing thread:", threadId);
        try {
          // Validate that the thread exists by retrieving its messages
          const messages = await openai.beta.threads.messages.list(threadId, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          
          console.log("Successfully validated existing thread, message count:", messages.data.length);
          
          // If we have a message, add it to the thread
          if (message) {
            await openai.beta.threads.messages.create(threadId, {
              role: 'user',
              content: message,
            }, {
              headers: {
                'OpenAI-Beta': 'assistants=v2'
              }
            });
            console.log("Added message to existing thread");
          }
          
          // Run the assistant on the existing thread - always use the fixed assistant ID
          console.log("Using fixed assistant ID:", assistantIdToUse);
          const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantIdToUse,
            tools: [], // No need for tools here as they're defined in the assistant
            metadata: {
              conversation_id: threadId,
              timestamp: new Date().toISOString()
            }
          }, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          
          console.log("Run created successfully for existing thread:", run.id);
          return new Response(
            JSON.stringify({ 
              runId: run.id,
              threadId: threadId,
              assistantInfo: {
                model: "gpt-4o-mini",
                assistantId: FIXED_ASSISTANT_ID
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error reusing thread:", error);
          // If the thread doesn't exist or there's an error, we'll create a new one below
          console.log("Will create a new thread instead");
        }
      }

      // Check if we need to check the status of a run
      if (reqBody.checkStatus && threadId && reqBody.runId) {
        console.log("Checking status of run:", reqBody.runId);
        try {
          const runStatus = await openai.beta.threads.runs.retrieve(threadId, reqBody.runId, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          
          console.log("Run status:", runStatus.status);
          return new Response(
            JSON.stringify({ status: runStatus.status }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error checking run status:", error);
          return new Response(
            JSON.stringify({ error: `Error checking run status: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check if we need to get messages
      if (reqBody.getMessages && threadId && reqBody.runId) {
        console.log("Getting messages for thread:", threadId);
        try {
          const messageList = await openai.beta.threads.messages.list(threadId, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          
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
                assistantId: FIXED_ASSISTANT_ID
              } 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error getting messages:", error);
          return new Response(
            JSON.stringify({ error: `Error getting messages: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Assistant mode
      if (!threadId) {
        // Create or retrieve assistant and thread
        console.log("Initializing assistant and thread");
        try {
          // Create or update assistant
          let assistant;
          try {
            // First, try to retrieve the fixed assistant
            console.log("Trying to retrieve fixed assistant:", FIXED_ASSISTANT_ID);
            try {
              assistant = await openai.beta.assistants.retrieve(FIXED_ASSISTANT_ID, {
                headers: {
                  'OpenAI-Beta': 'assistants=v2'
                }
              });
              console.log("Successfully retrieved fixed assistant:", assistant.id);
            } catch (retrieveError) {
              console.log("Fixed assistant not found, creating a new one");
              // Create a new assistant if the fixed one doesn't exist
              assistant = await openai.beta.assistants.create(assistantConfig, {
                headers: {
                  'OpenAI-Beta': 'assistants=v2'
                }
              });
              console.log("Created new assistant:", assistant.id);
              console.log("IMPORTANT: Save this assistant ID for future use:", assistant.id);
            }
          } catch (error) {
            console.error("Error managing assistant:", error);
            // Check if it's a version error and provide more details
            if (error.message && error.message.includes('v1 Assistants API has been deprecated')) {
              console.error("API version error. Headers used:", openai.defaultHeaders);
              // Try with explicit headers
              try {
                console.log("Retrying with explicit v2 header");
                try {
                  assistant = await openai.beta.assistants.retrieve("asst_DOAXZQD6pbB5wS27NxnOAOi9", {
                    headers: {
                      'OpenAI-Beta': 'assistants=v2'
                    }
                  });
                  console.log("Successfully retrieved fixed assistant with explicit header:", assistant.id);
                } catch (retrieveError) {
                  // Create a new assistant if the fixed one doesn't exist
                  assistant = await openai.beta.assistants.create(assistantConfig, {
                    headers: {
                      'OpenAI-Beta': 'assistants=v2'
                    }
                  });
                  console.log("Created new assistant with explicit header:", assistant.id);
                  console.log("IMPORTANT: Save this assistant ID for future use:", assistant.id);
                }
              } catch (retryError) {
                console.error("Retry also failed:", retryError);
                throw new Error(`Assistant management failed after retry: ${retryError.message}`);
              }
            } else {
              throw new Error(`Assistant management failed: ${error.message}`);
            }
          }

          // Create new thread
          const thread = await openai.beta.threads.create({}, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          console.log("Thread created successfully:", thread.id);
        
          return new Response(
            JSON.stringify({ 
              threadId: thread.id,
              assistantId: FIXED_ASSISTANT_ID,
              model: assistantConfig.model
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
          }, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          })
        } catch (error) {
          console.error("Error adding message to thread:", error);
          return new Response(
            JSON.stringify({ error: `Error adding message to thread: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Run the assistant with v2 configuration
      console.log("Running assistant for thread:", threadId);
      let run;
      try {
        // Use the fixed assistant ID instead of the one from the request
        console.log("Using fixed assistant ID:", assistantIdToUse);
        
        if (!assistantIdToUse) {
          throw new Error("No assistant ID available");
        }
        
        run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantIdToUse,
          tools: [], // No need for tools here as they're defined in the assistant
          metadata: {
            conversation_id: threadId,
            timestamp: new Date().toISOString()
          }
        }, {
          headers: {
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        // Return the run ID immediately after creating the run
        console.log("Run created successfully:", run.id);
        return new Response(
          JSON.stringify({ 
            runId: run.id,
            assistantInfo: {
              model: "gpt-4o-mini",
              assistantId: assistantIdToUse
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id, {
          headers: {
            'OpenAI-Beta': 'assistants=v2'
          }
        })
        
        let attempts = 0;
        const maxAttempts = 30; // Prevent infinite looping
        
        while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
          console.log(`Run status (attempt ${attempts+1}/${maxAttempts}):`, runStatus.status);
          if (runStatus.status === 'failed') {
            throw new Error('Assistant run failed: ' + JSON.stringify(runStatus.last_error))
          }
          // Wait for a second before checking again
          await new Promise(resolve => setTimeout(resolve, 1000))
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id, {
            headers: {
              'OpenAI-Beta': 'assistants=v2'
            }
          })
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
              assistantId: assistantIdToUse
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the messages
      console.log("Getting messages for thread:", threadId);
      let messageList;
      try {
        messageList = await openai.beta.threads.messages.list(threadId, {
          headers: {
            'OpenAI-Beta': 'assistants=v2'
          }
        })
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
            assistantId: assistantIdToUse
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Standard ChatGPT mode
      console.log("Using standard chat completion, useAssistant value:", useAssistant);
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
            },
            response: "STANDARD MODE: " + completion.choices[0].message.content
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
