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
