# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React-based personal productivity platform built with TypeScript, focusing primarily on **task management** with integrated AI assistance.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for server state, React Context for app state  
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI Integration**: OpenAI GPT for task intelligence and chat assistance
- **Animation**: Framer Motion + canvas-confetti for visual feedback

### Core Application Structure

The app follows a provider-wrapped architecture with these key global providers:
1. `AuthProvider` - Handles Supabase authentication
2. `PomodoroProvider` - Manages focus timer state across the app
3. `GlobalConfettiProvider` - Coordinates celebration animations
4. `TaskTickerProvider` - Manages task-related notifications/updates

### Primary Features (Active)

**Task Management** (`src/pages/Tasks.tsx`)
- Smart task creation with AI-powered categorization (`src/services/quickTaskService.ts`)
- Energy-level based task organization (high/low energy tasks)
- Project-based task grouping
- Drag-and-drop task prioritization
- Task completion with XP rewards and confetti animations

**Pomodoro Timer Integration**
- Global timer that persists across navigation (`TabBarTimer`)
- Optional screen blur overlay during focus sessions
- Task-specific Pomodoro tracking with distraction logging

**AI-Powered Task Intelligence**
- Automatic task analysis for priority, energy level, and project assignment
- Weekly task reflection with productivity insights
- Multi-agent listener architecture for real-time task creation from chat

### Database Schema (Supabase)

Core tables with Row Level Security enabled:
- `profiles` - User data (base table for all user_id references)  
- `tasks` - Main task management with energy_level, priority, project association
- `projects` - Task organization and grouping
- `pomodoro_sessions` - Focus session tracking with completion/distraction data
- `pomodoro_distractions` - Interruption logging during sessions

Optional tables (components exist but may not be fully integrated):
- `calendar_entries` - Event scheduling
- `quarterly_goals` - Long-term goal tracking  
- `weekly_intentions` - Weekly planning and reflection

### Key Service Layer

**Task Services** (`src/services/tasks/`)
- `taskBasicService.ts` - CRUD operations
- `taskXpService.ts` - Experience point calculations
- `taskReflectionService.ts` - AI-powered weekly insights
- `quickTaskService.ts` - AI task analysis and smart categorization

**AI Integration** (`src/services/`)
- `openaiClientService.ts` - Centralized OpenAI client
- `chatService.ts` - Assistant API integration
- Multi-agent listeners for specialized processing

### Component Architecture

**Task Components** (`src/components/tasks/`)
- Organized by functionality: creation, display, management, reflection
- Uses React Beautiful DnD for drag-and-drop interactions
- Integrates with global state providers for real-time updates

**UI Components** (`src/components/ui/`)
- Complete shadcn/ui implementation
- Custom extensions for task-specific interactions
- Consistent design system with Tailwind

### Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
VITE_OPENAI_CLIENT_KEY=your_openai_api_key
VITE_STRAVA_CLIENT_ID=your_strava_client_id (optional)
VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret (optional)
```

### Development Notes

- Uses strict TypeScript with ESLint configuration
- Unused variables warnings are disabled (`@typescript-eslint/no-unused-vars: "off"`)
- Vite dev server runs on `::` (all interfaces) port 8080
- Source maps enabled for production builds
- Path aliases: `@/` maps to `src/`

### Testing Architecture

The codebase includes a Multi-Agent Listener testing framework documented in `TESTING.md`. This allows testing of specialized AI agents that process messages alongside the main conversation assistant.