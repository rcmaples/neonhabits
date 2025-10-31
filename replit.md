# Overview

This is a cyberpunk-themed habit tracking application built as a full-stack web app. The application gamifies habit tracking by treating it like an RPG where users manage a character, complete daily habits and tasks, and earn rewards. The frontend features a futuristic cyberpunk aesthetic with neon colors and sci-fi terminology, while the backend provides a REST API for managing users, characters, habits, todos, and rewards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript and Vite as the build tool. The UI is built with shadcn/ui components and styled with Tailwind CSS using a custom cyberpunk color scheme. Key architectural decisions include:

- **Component Structure**: Organized into reusable UI components following the shadcn/ui pattern with custom cyberpunk styling
- **State Management**: TanStack Query for server state management with custom hooks for data fetching and mutations
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for the cyberpunk theme, including neon glow effects and grid patterns
- **Authentication**: Custom auth hook managing user state across components

## Backend Architecture
The server is built with Express.js and TypeScript, following a clean separation of concerns:

- **API Layer**: Express routes handling authentication, character management, habits, todos, and rewards
- **Storage Layer**: Abstract storage interface implemented with Drizzle ORM for database operations
- **Database**: PostgreSQL with Drizzle ORM for type-safe database queries and migrations
- **Authentication**: Session-based auth with bcrypt password hashing
- **Development Setup**: Vite middleware integration for hot reloading during development

## Data Storage
The application uses PostgreSQL as the primary database with the following schema design:

- **Users Table**: Email, username, password with unique constraints
- **Characters Table**: User's RPG character with level, XP, HP, credits, and avatar data
- **Habits Table**: Repeatable daily/weekly habits with difficulty, rewards, and streak tracking
- **Todos Table**: One-time tasks with priority levels and completion tracking
- **Equipment/Rewards Tables**: RPG-style items and rewards system
- **Habit Completions**: Historical tracking of habit completion events

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React icon library
- **Fonts**: Satoshi and Fira Code fonts from external CDNs
- **Authentication**: bcryptjs for password hashing
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Development Tools**: Replit-specific Vite plugins for development experience