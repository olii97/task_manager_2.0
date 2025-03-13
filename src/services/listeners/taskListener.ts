import { getOpenAIClient, isOpenAIClientAvailable } from '../openaiClientService';
import { ListenerResult, MessageListener } from './types';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

/**
 * Create a task in the database
 */
async function createTask(taskData: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          ...taskData,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    console.log('Task created successfully:', data);
    return data[0].id;
  } catch (error) {
    console.error('Exception creating task:', error);
    return null;
  }
}

/**
 * Creates a listener that detects task creation intent in messages
 */
export function createTaskListener(userId: string): MessageListener {
  return {
    async process(message: string): Promise<ListenerResult> {
      // Check if OpenAI client is available
      if (!isOpenAIClientAvailable()) {
        console.warn('OpenAI client not available. Task listener disabled.');
        return { actionDetected: false, actionType: 'none' };
      }

      try {
        const openai = getOpenAIClient();
        
        // Skip processing if somehow the client is still null
        if (!openai) {
          return { actionDetected: false, actionType: 'none' };
        }
        
        console.log('Task listener processing message:', message);
        
        // Use OpenAI to detect if this message contains a task
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: `You are a task detection specialist. Analyze if the message contains a task to be created.
                If yes, extract task details and respond with JSON:
                {
                  "shouldCreateTask": true,
                  "taskDetails": {
                    "title": "Task title",
                    "description": "Task description if available",
                    "priority": 1-4 (1 is highest),
                    "is_scheduled_today": true/false,
                    "energy_level": "high" or "low"
                  }
                }
                If no task is detected, respond with: {"shouldCreateTask": false}
                Be conservative - only detect clear task intentions.`
            },
            { role: "user", content: message }
          ],
          response_format: { type: "json_object" }
        });
        
        // Parse the response
        const result = JSON.parse(completion.choices[0].message.content);
        console.log('Task detection result:', result);
        
        if (result.shouldCreateTask) {
          // Create the task in the database
          const taskId = await createTask(result.taskDetails, userId);
          
          if (!taskId) {
            return { 
              actionDetected: true, 
              actionType: 'task_creation_failed',
              data: { 
                error: 'Failed to create task in database',
                task: result.taskDetails
              }
            };
          }
          
          // Return success with the created task details
          return {
            actionDetected: true,
            actionType: 'task_created',
            data: {
              task: {
                id: taskId,
                ...result.taskDetails
              },
              message: `Created task: "${result.taskDetails.title}"`
            }
          };
        }
        
        // No task detected
        return { actionDetected: false, actionType: 'none' };
      } catch (error) {
        console.error('Task listener error:', error);
        return { 
          actionDetected: false, 
          actionType: 'error', 
          data: { error: error.message || 'Unknown error in task listener' } 
        };
      }
    }
  };
} 