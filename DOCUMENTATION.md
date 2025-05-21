# Project Documentation

This document provides an overview of the project, its structure, and how to use it.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This application is a comprehensive personal wellness and productivity platform. It aims to help users build mindful routines, track habits, manage tasks, and integrate with fitness services. The platform is designed as an all-in-one solution for personal development, focusing on four key areas:

1.  **Mindfulness & Reflection**: Features a morning ritual with gratitude practice, intention setting, and journaling.
2.  **Task Management**: Offers smart task organization, including energy-based scheduling and a Pomodoro timer.
3.  **Health & Fitness**: Includes nutrition tracking, weight monitoring, and integration with Strava for workout activities.
4.  **Goal Setting**: Provides tools for tracking long-term goals and conducting weekly reflections.

## Features

Based on the current application structure (`src/App.tsx`), the **Task Management** capabilities are the primary active features. Other features described in the project's README exist within the codebase but are not currently integrated into the main application flow.

### Task Management (Primary Active Feature)
This is the core actively used part of the application, focusing on productivity and task organization.
- **Comprehensive Task Management**: Create, organize, and track tasks with prioritization.
    - Main task interface (`src/pages/Tasks.tsx`)
    - Task display and organization (`src/components/tasks/TaskList.tsx`)
    - Task analysis and processing for smart categorization (`src/services/quickTaskService.ts`)
- **Energy-Based Planning**: Organize tasks by the energy level required (high/low).
    - Energy level UI (`src/components/tasks/EnergyLevelSelector.tsx`)
    - Energy-based filtering (`src/components/tasks/TaskFilters.tsx`)
- **Pomodoro Timer**: A built-in focus timer with customizable work/break intervals to enhance productivity.
    - Timer interface (`src/components/pomodoro/PomodoroTimer.tsx`)
    - Timer state management (`src/components/pomodoro/PomodoroProvider.tsx`)
    - Persistent timer display, possibly in a tab bar (`src/components/pomodoro/TabBarTimer.tsx`)
    - Optional screen blur during Pomodoro sessions (`src/components/pomodoro/PomodoroBlurOverlay.tsx`)
- **Project Organization**: Group tasks by projects with progress tracking.
    - Project management (`src/components/projects/ProjectList.tsx`)
    - Project assignment (`src/components/tasks/ProjectSelector.tsx`)
- **Weekly Task Analysis**: AI-powered insights on task completion patterns.
    - Task analysis logic (`src/services/tasks/taskReflectionService.ts`)
- **Calendar Integration**: Schedule events using natural language processing. (Note: While `src/pages/Calendar.tsx` and `src/services/calendar/quickCalendarService.ts` exist, their integration into the active task management flow isn't fully clear from `src/App.tsx` alone and might be partial or upcoming.)
- **Task Ticker**: A context (`TaskTickerProvider`) suggests a feature for displaying task updates or a ticker, enhancing task awareness.
- **Global Confetti**: For celebrating task completions or achievements (`GlobalConfettiProvider`).

### Other Available Features (Codebase Only)
The following features are documented in the `README.md` and have corresponding code components. However, they are not currently routed or actively accessible in the main application flow defined in `src/App.tsx`.

#### Mindfulness & Reflection (Codebase Only)
Components for these features exist but are not integrated into the main app:
- **Morning Ritual**: A guided process with sunrise animation (`src/components/ritual/MeditationRitual.tsx`, `src/components/animations/Sunrise.tsx`).
- **Gratitude Practice**: AI-powered reflections on gratitude entries (`src/components/ritual/GratitudeSection.tsx`).
- **Intentions Setting**: Daily intentions with AI encouragement (`src/components/ritual/IntentionsSection.tsx`, `src/pages/Intentions.tsx`, `src/pages/IntentionsEdit.tsx`).
- **Journaling**: Thought capture with streak tracking (`src/pages/Journal.tsx`, `src/components/journal/JournalEditor.tsx`).
- **Weekly Reflections**: AI-assisted review (`src/components/journal/WeeklyReflection.tsx`).

#### Health & Fitness (Codebase Only)
Components for these features exist but are not integrated into the main app:
- **Strava Integration**: Display Strava activities (`src/pages/Strava.tsx`, `src/components/strava/StravaActivities.tsx`, `src/components/strava/StravaConnect.tsx`).
- **Nutrition Tracking**: Log meals with AI analysis (`src/pages/Nutrition.tsx`, `src/services/nutritionService.ts`, `src/components/nutrition/MacroBar.tsx`).
- **Weight Monitoring**: Track weight trends (`src/pages/Weight.tsx`, `src/components/weight/WeightChart.tsx`).
- **Macro Tracking**: Visualize nutrient distribution (`src/components/nutrition/MacroBreakdown.tsx`, `src/components/nutrition/NutritionGoals.tsx`).

#### Goals & Growth (Codebase Only)
Components for these features exist but are not integrated into the main app:
- **Goal Setting**: Create and track long-term goals (`src/pages/Goals.tsx`, `src/components/goals/GoalEditor.tsx`).
- **Progress Tracking**: Monitor objectives (`src/components/goals/GoalProgress.tsx`, `src/components/goals/MilestoneTracker.tsx`).
- **Quarterly Planning**: Reflection and planning reminders (`src/components/QuarterEndReminder.tsx`, `src/components/goals/QuarterlyReview.tsx`).

### AI Integration Points
The application's codebase includes OpenAI's GPT-3.5 Turbo model integration for several functionalities. Note that the practical availability of these AI points depends on the integration status of their parent features.
1.  **Morning Ritual (via `src/components/ritual/MeditationRitual.tsx` - Inactive Feature)**:
    - Analyzes gratitude entries with empathetic responses.
    - Provides encouraging insights for daily intentions.
    - Uses a mindful, supportive tone throughout.
2.  **Nutrition Analysis (via `src/services/nutritionService.ts` - Inactive Feature)**:
    - Processes natural language meal descriptions.
    - Extracts detailed nutritional information (calories, protein, carbs, fat, fiber, serving sizes, portions, ingredients).
3.  **Task Intelligence (via `src/services/quickTaskService.ts` - Active Feature)**:
    - Analyzes task descriptions for smart categorization.
    - Determines priority levels and energy requirements.
    - Suggests project associations and scheduling.
4.  **Calendar Processing** (`src/services/calendar/quickCalendarService.ts`):
    - Interprets natural language event descriptions.
    - Extracts dates, times, and event types.
    - Sets up appropriate recurrence and reminder patterns.
5.  **Weekly Task Reflection** (`src/services/tasks/taskReflectionService.ts`):
    - Provides insights on task completion patterns.
    - Offers suggestions for productivity improvements.
    - Celebrates achievements and progress.

## Getting Started

To get the project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    ```
    Replace `<YOUR_GIT_URL>` with the actual URL of the repository.

2.  **Navigate to the project directory:**
    ```sh
    cd reflect-nourish-connect
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:
    ```env
    VITE_OPENAI_API_KEY=your_openai_api_key
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_STRAVA_CLIENT_ID=your_strava_client_id
    VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
    ```
    Replace the placeholder values with your actual API keys and URLs.

5.  **Start the development server:**
    ```sh
    npm run dev
    ```
    This will start the application, typically available at `http://localhost:5173` or a similar address.

## Technical Architecture

The application is built with the following technical stack:

### Frontend
-   **Framework**: React with TypeScript
-   **State Management**: React Query for server state, Context API for application state
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **Animation**: Framer Motion for smooth UI transitions

### Backend Services
-   **Authentication**: Supabase Auth
-   **Database**: Supabase PostgreSQL
-   **AI Integration**: OpenAI GPT-3.5 Turbo
-   **Fitness Integration**: Strava API

### Core Components
-   **AuthProvider**: Manages user authentication and session state.
-   **PomodoroProvider**: Handles the focus timer functionality and its integration with tasks.
-   **Settings System**: Allows users to customize their preferences and application settings.
-   **Analytics Service**: Provides optional usage tracking to help improve the application (if implemented).

## Database Schema

This section outlines the database schema for the Task Manager application, explaining table relationships and data flow.

### Core Tables

#### 1. Profiles (`profiles`)
The base table for user data. All other tables reference this table through `user_id`.
```typescript
{
  id: UUID (Primary Key)
  created_at: Timestamp
  updated_at: Timestamp
}
```

#### 2. Projects (`projects`)
Organizes tasks into projects. Each project belongs to a user.
```typescript
{
  id: UUID (Primary Key)
  name: string
  description: string
  color: string
  is_active: boolean
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

#### 3. Tasks (`tasks`)
The main table for managing tasks. Tasks can be associated with projects.
```typescript
{
  id: UUID (Primary Key)
  title: string
  description: string
  due_date: Timestamp
  completion_date: Timestamp
  priority: number
  is_completed: boolean
  is_scheduled_today: boolean
  energy_level: string
  project_id: UUID (Foreign Key → projects.id)
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

#### 4. Pomodoro Sessions (`pomodoro_sessions`)
Tracks work sessions for tasks using the Pomodoro technique.
```typescript
{
  id: UUID (Primary Key)
  duration_minutes: number
  start_time: Timestamp
  end_time: Timestamp
  completed: boolean
  task_id: UUID (Foreign Key → tasks.id)
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

#### 5. Pomodoro Distractions (`pomodoro_distractions`)
Tracks interruptions during Pomodoro sessions.
```typescript
{
  id: UUID (Primary Key)
  description: string
  session_id: UUID (Foreign Key → pomodoro_sessions.id)
  created_at: Timestamp
}
```

### Optional Tables

#### 6. Calendar Entries (`calendar_entries`)
For scheduling tasks and deadlines.
```typescript
{
  id: UUID (Primary Key)
  title: string
  description: string
  date: Timestamp
  entry_type: string
  has_reminder: boolean
  reminder_days_before: number
  is_recurring: boolean
  recurrence_pattern: string
  status: string
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

#### 7. Quarterly Goals (`quarterly_goals`)
For long-term goal setting.
```typescript
{
  id: UUID (Primary Key)
  description: string
  category: string
  quarter: number
  year: number
  is_completed: boolean
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

#### 8. Weekly Intentions (`weekly_intentions`)
For weekly planning and reflection.
```typescript
{
  id: UUID (Primary Key)
  week_start: Date
  intention_1: string
  intention_2: string
  intention_3: string
  reflection_1: string
  reflection_2: string
  reflection_3: string
  status: string
  created_at: Timestamp
  updated_at: Timestamp
  user_id: UUID (Foreign Key → profiles.id)
}
```

### Table Relationships

#### User-Centric Structure
-   All tables (except `pomodoro_distractions`) have a direct `user_id` reference to `profiles`.
-   This ensures data isolation between users.
-   Row Level Security (RLS) policies enforce this relationship.

#### Task Management Flow
1.  Users create projects.
2.  Tasks are created within projects (optional).
3.  Tasks can be worked on using Pomodoro sessions.
4.  Pomodoro sessions can have distractions logged.

#### Optional Planning Features
1.  Calendar entries can be used to schedule tasks.
2.  Quarterly goals provide long-term planning.
3.  Weekly intentions help with weekly planning and reflection.

### Data Flow Examples

#### Creating a Task
1.  User creates a project (optional).
2.  User creates a task, optionally linking it to a project.
3.  Task can be scheduled in calendar entries.

#### Working on a Task
1.  User starts a Pomodoro session for a task.
2.  During the session, distractions can be logged.
3.  Session completion is recorded.
4.  Task completion can be updated.

#### Planning Work
1.  User sets quarterly goals.
2.  User plans weekly intentions.
3.  User schedules tasks in calendar.
4.  User organizes tasks into projects.

### Security
-   Row Level Security (RLS) is enabled on all tables.
-   Users can only access their own data.
-   Foreign key constraints ensure data integrity.
-   Cascading deletes are implemented where appropriate.

### Performance
-   Indexes are created on frequently queried columns.
-   Foreign key relationships are indexed.
-   Timestamp fields are indexed for efficient date-based queries.

## Project Structure

The project follows a standard React application structure. Key directories related to the active Task Management features include:

-   **`src/`**: Contains all the source code for the application.
    -   **`components/`**: Reusable UI components used across the application.
        -   `AppHeader.tsx`: The main application header.
        -   `AuthProvider.tsx`: Handles authentication logic.
        -   `pomodoro/`: Components related to the Pomodoro timer (e.g., `PomodoroTimer.tsx`, `PomodoroProvider.tsx`).
        -   `tasks/`: Components for task creation, display, and management (e.g., `TaskList.tsx`, `EnergyLevelSelector.tsx`).
        -   `projects/`: Components related to project organization for tasks.
        -   `ui/`: General UI elements, likely from a UI library like shadcn/ui (e.g., `toaster.tsx`, `tooltip.tsx`).
    -   **`pages/`**: Top-level components that represent different pages or views of the application.
        -   `Tasks.tsx`: The main page for task management, which is the primary active feature.
        -   `Auth.tsx`: Handles user authentication (login/signup).
        -   `LandingPage.tsx`: The page shown to unauthenticated users.
        -   `NotFound.tsx`: Page displayed for invalid URLs.
        -   (Other pages like `Journal.tsx`, `Goals.tsx`, `Nutrition.tsx`, `Strava.tsx` exist but are currently not routed in the main app).
    -   **`services/`**: Modules for interacting with external APIs or handling business logic.
        -   `quickTaskService.ts`: Handles AI-powered task analysis and processing.
        -   `tasks/taskReflectionService.ts`: Provides AI-powered insights on task completion.
        -   (Other services like `nutritionService.ts`, `calendar/quickCalendarService.ts` exist but their corresponding features are not fully active).
    -   **`hooks/`**: Custom React hooks for reusable logic.
        -   `useIntroScreen.ts`: Manages the display of the introductory screen.
        -   `use-toast.ts`: Hook for displaying toast notifications.
    -   **`contexts/`**: React context providers for global state management.
        -   `TaskTickerContext.tsx`: Likely related to displaying task updates.
        -   (Other contexts like `GlobalConfettiContext.tsx` are also present).
    -   **`App.tsx`**: The main application component, responsible for routing and global providers.
    -   **`main.tsx`**: The entry point of the React application.
-   **`public/`**: Static assets that are publicly accessible.

## Usage

The application's primary active feature is Task Management. Here's how to use its main functionalities:

1.  **Authentication**:
    -   Navigate to the `/auth` page to log in or create a new account.
    -   Alternatively, the `/landing` page will direct you to authentication if you try to access the app without being logged in.

2.  **Accessing Task Management**:
    -   Once logged in, you will be directed to the main Tasks page (`/`).

3.  **Creating a Task**:
    -   Look for an "Add Task" or similar button/input field on the Tasks page.
    -   Enter the task title, description, due date (if applicable), and assign an energy level.
    -   You may also be able to assign the task to a project.

4.  **Managing Tasks**:
    -   View your tasks in the task list.
    -   Mark tasks as complete.
    -   Filter tasks (e.g., by energy level or project).
    -   Prioritize tasks as needed.

5.  **Using the Pomodoro Timer**:
    -   Locate the Pomodoro timer controls (often represented by a tomato icon or a timer display).
    -   Start the timer for a focused work session on a specific task.
    -   The timer will typically run for a set period (e.g., 25 minutes), followed by a short break.
    -   Some visual cues, like a screen blur (`PomodoroBlurOverlay`) or a persistent timer in the tab bar (`TabBarTimer`), might be active.

6.  **AI-Powered Features**:
    -   **Task Intelligence**: When creating tasks, the AI might automatically suggest categories, priorities, or energy levels based on the task description.
    -   **Weekly Task Reflection**: The system may provide insights into your task completion patterns and productivity.

(Note: Since other features like Journaling, Goals, Nutrition, etc., are not actively routed in the application, usage instructions for them are omitted here. If these features become active, this section should be updated.)

## Contributing

Feel free to submit issues and enhancement requests. Follow these steps for contributions:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
