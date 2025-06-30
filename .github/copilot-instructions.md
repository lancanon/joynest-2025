# Copilot Instructions for Joynest E-commerce Application

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js 15 e-commerce application called "Joynest" built with:
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Architecture Guidelines
- Use App Router with the `src/` directory structure
- Implement Server Components by default, use Client Components only when necessary
- Follow Next.js 15 best practices for data fetching and caching
- Use TypeScript strict mode for better type safety
- Implement proper error boundaries and loading states

## Key Features
1. **Authentication**: User registration, login, logout
2. **Item Management**: Create, read, update, delete items with pricing
3. **Offer System**: Place offers on items, accept/reject offers
4. **Authorization**: Protect routes based on user authentication status
5. **Responsive Design**: Mobile-first design with Tailwind CSS

## Database Schema
- **Users**: Managed by Supabase Auth
- **Items**: id, title, description, price, image_url, user_id, created_at, updated_at
- **Offers**: id, item_id, user_id, amount, status (pending/accepted/rejected), created_at

## Code Standards
- Use functional components with hooks
- Implement proper TypeScript interfaces and types
- Follow Next.js file-based routing conventions
- Use Supabase client for database operations
- Implement proper error handling and loading states
- Use Server Actions for form submissions when appropriate
