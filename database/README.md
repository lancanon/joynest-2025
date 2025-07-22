# Database Setup Guide

## Quick Setup

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Schema**
   ```sql
   -- Copy and paste the entire contents of database/schema.sql
   -- Then click "Run" to execute
   ```

3. **Verify Setup**
   - You should see a success message: "Database schema successfully created and validated!"
   - Check that these tables exist in your database:
     - `items` (product listings)
     - `profiles` (user profiles)  
     - `offers` (purchase offers)

4. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and keys

## Features Included

✅ **Complete Database Schema**
- All tables with proper relationships
- Optimized indexes for performance
- Row Level Security (RLS) policies

✅ **User Management**
- Automatic profile creation for new users
- Secure authentication with Supabase Auth

✅ **Item Management**
- Categories and conditions
- Image upload support
- Sold status tracking

✅ **Offer System**
- Make offers on items
- Accept/reject functionality
- Automatic item marking as sold

✅ **Security**
- RLS policies for data protection
- Secure file upload policies
- Proper user permissions

## Troubleshooting

**If you see errors:**
1. Make sure you're using a fresh Supabase project, or
2. The schema will handle existing tables gracefully

**If policies conflict:**
- The schema drops existing policies and recreates them
- This ensures clean setup every time

## Need Help?

Check the main README.md for complete setup instructions and troubleshooting.
