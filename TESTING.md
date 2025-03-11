# Testing the Multi-Agent Listener Architecture

This document provides instructions for testing the new Multi-Agent Listener architecture that enables specialized AI agents to process messages alongside the main conversation assistant.

## Setup

1. First, add your OpenAI API key to the `.env` file:
   ```
   # For Vite (recommended)
   VITE_OPENAI_CLIENT_KEY=sk-your-actual-api-key
   
   # For other environments (Create React App, etc.)
   REACT_APP_OPENAI_CLIENT_KEY=sk-your-actual-api-key
   ```

2. Restart your development server to ensure the environment variables are loaded.

## Testing the Task Listener

We've added a side-by-side test panel to visualize how the task listener processes messages separately from the main assistant.

1. Start your application and navigate to the chat component
2. Click "Show Test Panel" to display the listener test panel
3. Try sending these example messages to test different scenarios:

### Task Creation Test Cases

| Test Message                                   | Expected Behavior                      |
|-----------------------------------------------|-----------------------------------------|
| "I need to buy groceries tomorrow"            | Should detect and create a task        |
| "Can you add a task to call John?"            | Should detect and create a task        |
| "Create a high priority task for my project"  | Should detect and create a task        |
| "What's the weather like today?"              | Should NOT detect a task               |
| "Tell me a joke"                              | Should NOT detect a task               |

## Toggling Listeners On/Off

We've added a toggle feature to enable or disable the listener system:

1. **In the Chat Interface**: Look for the ear icon in the header. Click it to toggle listeners on/off.
2. **Before Starting Chat**: On the initial screen, you'll see a "Listeners On/Off" button.
3. **Settings Menu**: Click the info icon to access settings where you can toggle listeners.

When listeners are disabled:
- No token usage will occur for listener processing
- The test panel will show that listeners are disabled
- Messages will only be processed by the main assistant

This feature is useful for:
- Reducing API costs during development
- Testing the application without listener interference
- Comparing behavior with and without listeners

Your listener preference is saved in localStorage and will persist between sessions.

## Understanding the Test Panel

The test panel shows:

1. The raw message sent to the listener
2. The JSON response from the task detection model
3. Whether a task would be created and its details
4. The current status of the listener system (enabled/disabled)

## How It Works

The Multi-Agent Listener architecture works as follows:

1. When you send a message, it's processed by both:
   - The main conversational assistant (OpenAI Assistants API)
   - The specialized task listener (Direct Chat Completions API)

2. The task listener quickly determines if the message contains a task to create

3. If a task is detected:
   - The task is created in the database
   - A system message appears in the chat notifying you
   - The main assistant continues to process your message normally

4. The user gets the benefit of both:
   - Fast, reliable task creation
   - Natural conversational responses

This approach separates concerns, improves reliability, and provides a better user experience.

## Performance Optimization

To reduce token usage and improve performance:

1. We use the smaller `gpt-3.5-turbo` model for task detection
2. The listener toggle allows you to disable listeners when not needed
3. The system is designed to only process clear task creation intents 