# Overview

WanderAI is an AI-powered travel planning application that helps users create personalized itineraries. The application uses artificial intelligence to generate detailed travel recommendations based on user preferences like budget, destination, travel dates, group size, and theme. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React Query (TanStack Query) for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: Custom translation service with support for 20+ languages
- **Currency Support**: Multi-currency system with real-time conversion

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with structured error handling
- **Middleware**: Custom logging, JSON parsing, and error handling
- **AI Integration**: OpenAI GPT integration for itinerary generation
- **Development**: Hot module replacement with Vite integration

## Data Storage
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for users, trips, destinations, and bookings
- **Migrations**: Drizzle Kit for database schema management

## Key Features
- **AI Itinerary Generation**: Uses OpenAI to create personalized travel plans
- **Multi-language Support**: Automatic language detection with manual override
- **Currency Conversion**: Real-time exchange rates with user preference storage
- **Geolocation**: Auto-detection of user location for defaults
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Progressive Enhancement**: Works without JavaScript for core functionality

## External Dependencies

### Core Services
- **OpenAI API**: GPT model integration for AI-powered itinerary generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Places API**: Location autocomplete and place details (referenced in components)

### Payment Integration
- **Stripe**: Payment processing with React Stripe.js integration

### Development Tools
- **Replit Integration**: Development environment with hot reload and error overlay
- **TypeScript**: Full-stack type safety
- **ESBuild**: Fast production builds

### UI and Styling
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### State and Data Management
- **React Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Zod**: Runtime type validation

The application follows a modular architecture with clear separation between client and server code, shared type definitions, and a consistent API pattern throughout.