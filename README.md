# Joynest - E-commerce Platform

A modern, production-ready e-commerce web application built with Next.js 15, TypeScript, and Supabase. Features secure user authentication, real-time item browsing, offer management, and a robust purchase system with Row Level Security.

## Features

- **User Authentication**: Register, login, and logout with Supabase Auth
- **Item Management**: Create, view, edit, and delete items
- **Offer System**: Place offers on items and accept/reject offers
- **Authorization**: Protected routes and user-specific actions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data updates with Supabase

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd joynest-2025
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Set up the database by running the SQL commands in `database/schema.sql` in your Supabase SQL editor.

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

### Tables

- **items**: Store item listings with title, description, price, and image
- **offers**: Store offers made on items with amount and status
- **auth.users**: Managed by Supabase Auth for user authentication

### Row Level Security (RLS)

- Items are publicly viewable but only editable by their owners
- Offers are visible to item owners and offer creators
- Users can only make offers on items they don't own

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── items/             # Item-related pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── contexts/              # React contexts (Auth)
├── lib/                   # Utility libraries (Supabase)
└── globals.css           # Global styles
```

## Key Features Implementation

### Authentication
- JWT-based authentication with Supabase
- Protected routes for authenticated users
- Persistent login state across sessions

### Item Management
- CRUD operations for items
- Image URL support for item photos
- User ownership validation

### Offer System
- Users can make monetary offers on items
- Item owners can accept or reject offers
- Status tracking (pending/accepted/rejected)

### Authorization
- Row Level Security policies in Supabase
- Client-side route protection
- User-specific data access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
