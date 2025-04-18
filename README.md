# Reflect, Nourish, Connect

A comprehensive personal wellness and productivity platform that helps users build mindful routines, track habits, manage tasks, and integrate with fitness services. The application features a beautiful, intuitive interface with multiple wellness dimensions integrated into a cohesive ecosystem.

## Project Overview

This application is designed as an all-in-one platform for personal development, combining:

1. **Mindfulness & Reflection**: Morning ritual with gratitude practice, intentions setting, and journaling
2. **Task Management**: Smart task organization with energy-based scheduling and pomodoro timer
3. **Health & Fitness**: Nutrition tracking, weight monitoring, and Strava workout integration
4. **Goal Setting**: Long-term goal tracking and weekly reflections

## Key Features

### Mindfulness & Reflection
*Key files: `src/components/ritual/`, `src/pages/MorningRitual.tsx`, `src/pages/Journal.tsx`*
- 🌅 **Morning Ritual**: Guided process with Monument Valley-inspired sunrise animation
  - `src/components/ritual/MeditationRitual.tsx` - Core ritual component
  - `src/components/animations/Sunrise.tsx` - Animated background
- 🙏 **Gratitude Practice**: Enter items you're grateful for with AI-powered reflections
  - `src/components/ritual/GratitudeSection.tsx` - Gratitude input and display
- 🎯 **Intentions Setting**: Set daily intentions with personalized AI encouragement
  - `src/components/ritual/IntentionsSection.tsx` - Intentions management
  - `src/pages/Intentions.tsx` - Intentions overview
  - `src/pages/IntentionsEdit.tsx` - Editing interface
- 📝 **Journaling**: Capture thoughts and reflections with streak tracking
  - `src/pages/Journal.tsx` - Journal interface
  - `src/components/journal/JournalEditor.tsx` - Rich text editor
- 🔄 **Weekly Reflections**: AI-assisted review of your accomplishments and patterns
  - `src/components/journal/WeeklyReflection.tsx` - Weekly review UI

### Productivity
*Key files: `src/components/tasks/`, `src/components/pomodoro/`, `src/pages/Tasks.tsx`*
- ✅ **Task Management**: Create, organize, and track tasks with prioritization
  - `src/pages/Tasks.tsx` - Main task interface
  - `src/components/tasks/TaskList.tsx` - Task display and organization
  - `src/services/quickTaskService.ts` - Task analysis and processing
- ⚡ **Energy-Based Planning**: Organize tasks by energy level required (high/low)
  - `src/components/tasks/EnergyLevelSelector.tsx` - Energy level UI
  - `src/components/tasks/TaskFilters.tsx` - Energy-based filtering
- 🍅 **Pomodoro Timer**: Built-in focus timer with work/break intervals
  - `src/components/pomodoro/PomodoroTimer.tsx` - Timer interface
  - `src/components/pomodoro/PomodoroProvider.tsx` - Timer state management
  - `src/components/pomodoro/TabBarTimer.tsx` - Persistent timer display
- 🗂️ **Project Organization**: Group tasks by projects with progress tracking
  - `src/components/projects/ProjectList.tsx` - Project management
  - `src/components/tasks/ProjectSelector.tsx` - Project assignment
- 📊 **Weekly Task Analysis**: AI-powered insights on task completion patterns
  - `src/services/tasks/taskReflectionService.ts` - Task analysis logic
- 📆 **Calendar Integration**: Schedule events with natural language processing
  - `src/pages/Calendar.tsx` - Calendar interface
  - `src/services/calendar/quickCalendarService.ts` - Event processing

### Health & Fitness
*Key files: `src/pages/Nutrition.tsx`, `src/pages/Weight.tsx`, `src/components/strava/`*
- 🏃‍♂️ **Strava Integration**: Connect and display your Strava workout activities
  - `src/pages/Strava.tsx` - Strava dashboard
  - `src/components/strava/StravaActivities.tsx` - Activity display
  - `src/components/strava/StravaConnect.tsx` - Authentication
- 🥗 **Nutrition Tracking**: Log meals with AI analysis of nutritional content
  - `src/pages/Nutrition.tsx` - Nutrition interface
  - `src/services/nutritionService.ts` - Meal analysis
  - `src/components/nutrition/MacroBar.tsx` - Macro visualization
- ⚖️ **Weight Monitoring**: Track weight trends over time
  - `src/pages/Weight.tsx` - Weight tracking interface
  - `src/components/weight/WeightChart.tsx` - Trend visualization
- 📈 **Macro Tracking**: Visualize protein, carbs, and fat distribution
  - `src/components/nutrition/MacroBreakdown.tsx` - Detailed macro analysis
  - `src/components/nutrition/NutritionGoals.tsx` - Goal setting

### Goals & Growth
*Key files: `src/pages/Goals.tsx`, `src/components/goals/`*
- 🏆 **Goal Setting**: Create and track long-term goals
  - `src/pages/Goals.tsx` - Goals interface
  - `src/components/goals/GoalEditor.tsx` - Goal creation/editing
- 📈 **Progress Tracking**: Monitor advancement toward your objectives
  - `src/components/goals/GoalProgress.tsx` - Progress visualization
  - `src/components/goals/MilestoneTracker.tsx` - Milestone tracking
- 🌱 **Quarterly Planning**: Reminders for quarter-end reflection and planning
  - `src/components/QuarterEndReminder.tsx` - Planning notifications
  - `src/components/goals/QuarterlyReview.tsx` - Review interface

## AI Integration Points

The application leverages OpenAI's GPT-3.5 Turbo model in several key areas:

1. **Morning Ritual** (`src/components/ritual/MeditationRitual.tsx`):
   - Analyzes gratitude entries with empathetic responses
   - Provides encouraging insights for daily intentions
   - Uses mindful, supportive tone throughout

2. **Nutrition Analysis** (`src/services/nutritionService.ts`):
   - Processes natural language meal descriptions
   - Extracts detailed nutritional information including:
     - Calories, protein, carbs, fat, and fiber
     - Serving sizes and portions
     - Meal components and ingredients

3. **Task Intelligence** (`src/services/quickTaskService.ts`):
   - Analyzes task descriptions for smart categorization
   - Determines priority levels and energy requirements
   - Suggests project associations and scheduling

4. **Calendar Processing** (`src/services/calendar/quickCalendarService.ts`):
   - Interprets natural language event descriptions
   - Extracts dates, times, and event types
   - Sets up appropriate recurrence and reminder patterns

5. **Weekly Task Reflection** (`src/services/tasks/taskReflectionService.ts`):
   - Provides insights on task completion patterns
   - Offers suggestions for productivity improvements
   - Celebrates achievements and progress

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Query for server state, Context API for application state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animation**: Framer Motion for smooth UI transitions

### Backend Services
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Fitness Integration**: Strava API

### Core Components
- **AuthProvider**: User authentication and session management
- **PomodoroProvider**: Focus timer with task integration
- **Settings System**: User preferences and customization
- **Analytics Service**: Optional usage tracking for improvements

## Getting Started

1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
```

2. Install dependencies
```sh
cd reflect-nourish-connect
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
```

4. Start the development server
```sh
npm run dev
```

## Deployment

The project can be deployed through [Lovable](https://lovable.dev/projects/42d6cc69-479d-423c-9649-458383e6ca01) or using your preferred hosting service like Netlify.

## Contributing

Feel free to submit issues and enhancement requests. Follow these steps for contributions:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Task Manager Database Schema

This document outlines the database schema for the Task Manager application, explaining table relationships and data flow.

## Core Tables

### 1. Profiles (`profiles`)
The base table for user data. All other tables reference this table through `user_id`.

```typescript
{
  id: UUID (Primary Key)
  created_at: Timestamp
  updated_at: Timestamp
}
```

### 2. Projects (`projects`)
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

### 3. Tasks (`tasks`)
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

### 4. Pomodoro Sessions (`pomodoro_sessions`)
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

### 5. Pomodoro Distractions (`pomodoro_distractions`)
Tracks interruptions during Pomodoro sessions.

```typescript
{
  id: UUID (Primary Key)
  description: string
  session_id: UUID (Foreign Key → pomodoro_sessions.id)
  created_at: Timestamp
}
```

## Optional Tables

### 6. Calendar Entries (`calendar_entries`)
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

### 7. Quarterly Goals (`quarterly_goals`)
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

### 8. Weekly Intentions (`weekly_intentions`)
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

## Table Relationships

### User-Centric Structure
- All tables (except `pomodoro_distractions`) have a direct `user_id` reference to `profiles`
- This ensures data isolation between users
- Row Level Security (RLS) policies enforce this relationship

### Task Management Flow
1. Users create projects
2. Tasks are created within projects (optional)
3. Tasks can be worked on using Pomodoro sessions
4. Pomodoro sessions can have distractions logged

### Optional Planning Features
1. Calendar entries can be used to schedule tasks
2. Quarterly goals provide long-term planning
3. Weekly intentions help with weekly planning and reflection

## Data Flow Examples

### Creating a Task
1. User creates a project (optional)
2. User creates a task, optionally linking it to a project
3. Task can be scheduled in calendar entries

### Working on a Task
1. User starts a Pomodoro session for a task
2. During the session, distractions can be logged
3. Session completion is recorded
4. Task completion can be updated

### Planning Work
1. User sets quarterly goals
2. User plans weekly intentions
3. User schedules tasks in calendar
4. User organizes tasks into projects

## Security
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Foreign key constraints ensure data integrity
- Cascading deletes are implemented where appropriate

## Performance
- Indexes are created on frequently queried columns
- Foreign key relationships are indexed
- Timestamp fields are indexed for efficient date-based queries
