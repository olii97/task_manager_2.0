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
- 🌅 **Morning Ritual**: Guided process with Monument Valley-inspired sunrise animation
- 🙏 **Gratitude Practice**: Enter items you're grateful for with AI-powered reflections
- 🎯 **Intentions Setting**: Set daily intentions with personalized AI encouragement
- 📝 **Journaling**: Capture thoughts and reflections with streak tracking
- 🔄 **Weekly Reflections**: AI-assisted review of your accomplishments and patterns

### Productivity
- ✅ **Task Management**: Create, organize, and track tasks with prioritization
- ⚡ **Energy-Based Planning**: Organize tasks by energy level required (high/low)
- 🍅 **Pomodoro Timer**: Built-in focus timer with work/break intervals
- 🗂️ **Project Organization**: Group tasks by projects with progress tracking
- 📊 **Weekly Task Analysis**: AI-powered insights on task completion patterns
- 📆 **Calendar Integration**: Schedule events with natural language processing

### Health & Fitness
- 🏃‍♂️ **Strava Integration**: Connect and display your Strava workout activities
- 🥗 **Nutrition Tracking**: Log meals with AI analysis of nutritional content
- ⚖️ **Weight Monitoring**: Track weight trends over time
- 📈 **Macro Tracking**: Visualize protein, carbs, and fat distribution

### Goals & Growth
- 🏆 **Goal Setting**: Create and track long-term goals
- 📈 **Progress Tracking**: Monitor advancement toward your objectives
- 🌱 **Quarterly Planning**: Reminders for quarter-end reflection and planning

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
