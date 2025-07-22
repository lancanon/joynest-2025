-- ================================================
-- JOYNEST E-COMMERCE DATABASE SCHEMA
-- ================================================
-- 
-- A complete database schema for a modern e-commerce marketplace
-- Built for Next.js 15 + Supabase + TypeScript
--
-- Features:
-- • User authentication with Supabase Auth
-- • Item listings with categories and conditions  
-- • Offer system with automatic status handling
-- • Purchase system with buyer tracking
-- • Row Level Security (RLS) for data protection
-- • Automatic profile creation for new users
-- • Image storage with proper policies
-- • Optimized indexes for performance
--
-- Usage:
-- 1. Run this script in your Supabase SQL editor
-- 2. All tables, policies, functions, and triggers will be created
-- 3. The system is ready for production use
--
-- Author: Audy Vee
-- Last Updated: July 2025
-- ================================================

-- Create the items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  condition VARCHAR(50) DEFAULT 'Good' CHECK (condition IN ('Mint', 'Excellent', 'Good', 'Fair', 'Poor')),
  category VARCHAR(100) DEFAULT 'Other' CHECK (category IN ('Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Office', 'Outdoor', 'Electronics', 'Clothing', 'Other')),
  image_url TEXT,
  is_sold BOOLEAN DEFAULT FALSE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who bought the item
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the profiles table for user data
-- display_name is what appears to other users (can be customized)
-- username is for login/identification (unique)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100), -- What other users see (can be customized)
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_buyer_id_idx ON items(buyer_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS items_is_sold_idx ON items(is_sold);
CREATE INDEX IF NOT EXISTS offers_item_id_idx ON offers(item_id);
CREATE INDEX IF NOT EXISTS offers_user_id_idx ON offers(user_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Add is_sold column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'items' AND column_name = 'is_sold') THEN
        ALTER TABLE items ADD COLUMN is_sold BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add buyer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'items' AND column_name = 'buyer_id') THEN
        ALTER TABLE items ADD COLUMN buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Anyone can view items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Item owners and offer creators can view offers" ON offers;
DROP POLICY IF EXISTS "Users can insert offers on others' items" ON offers;
DROP POLICY IF EXISTS "Item owners can update offer status" ON offers;
DROP POLICY IF EXISTS "Users can delete their own pending offers" ON offers;

-- RLS Policies for items table
-- Anyone can view items
CREATE POLICY "Anyone can view items" ON items
  FOR SELECT USING (true);

-- Users can insert their own items
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profiles table
-- Anyone can view profiles (for usernames, etc.)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for offers table
-- Item owners and offer creators can view offers
CREATE POLICY "Item owners and offer creators can view offers" ON offers
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM items WHERE id = offers.item_id
    )
  );

-- Authenticated users can insert offers (but not on their own items or sold items)
CREATE POLICY "Users can insert offers on others' items" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() != (
      SELECT user_id FROM items WHERE id = offers.item_id
    ) AND
    NOT EXISTS (
      SELECT 1 FROM items WHERE id = offers.item_id AND is_sold = TRUE
    )
  );

-- Item owners can update offer status
CREATE POLICY "Item owners can update offer status" ON offers
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM items WHERE id = offers.item_id
    )
  );

-- Users can delete their own offers (only if pending)
CREATE POLICY "Users can delete their own pending offers" ON offers
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- ===== STORAGE SETUP =====
-- Create a bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for item-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow anyone to view item images (public bucket)
CREATE POLICY "Anyone can view item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

-- Allow users to delete any item images (for cleanup when editing/deleting items)
CREATE POLICY "Authenticated users can delete item images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update any item images
CREATE POLICY "Authenticated users can update item images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'item-images' AND 
    auth.role() = 'authenticated'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle offer acceptance and mark item as sold
CREATE OR REPLACE FUNCTION handle_offer_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If offer status changed to 'accepted', mark the item as sold and set buyer
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE items 
    SET is_sold = TRUE, 
        buyer_id = NEW.user_id,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.item_id;
    
    -- Reject all other pending offers for this item
    UPDATE offers 
    SET status = 'rejected'
    WHERE item_id = NEW.item_id 
      AND id != NEW.id 
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically handle item sale when offer is accepted
CREATE OR REPLACE TRIGGER on_offer_status_change
  AFTER UPDATE ON offers
  FOR EACH ROW 
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION handle_offer_acceptance();

-- Function to handle new user registration (creates profile automatically)
-- This ensures every new user gets a profile with display_name set to their username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)), -- display_name defaults to username
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== DATA MIGRATION AND FIXES =====
-- Fix any existing users who might not have profiles

-- Create missing profiles for users who have items but no profile
INSERT INTO profiles (id, username, display_name, created_at, updated_at)
SELECT DISTINCT 
  i.user_id,
  COALESCE(
    (au.raw_user_meta_data->>'username')::text,
    au.email,
    'user_' || SUBSTRING(i.user_id::text, 1, 8)
  ) as username,
  COALESCE(
    (au.raw_user_meta_data->>'username')::text,
    au.email,
    'User ' || SUBSTRING(i.user_id::text, 1, 8)
  ) as display_name,
  NOW() as created_at,
  NOW() as updated_at
FROM items i
LEFT JOIN profiles p ON i.user_id = p.id
LEFT JOIN auth.users au ON i.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create profiles for any auth users who don't have profiles yet
INSERT INTO profiles (id, username, display_name, created_at, updated_at)
SELECT DISTINCT 
  au.id,
  COALESCE(
    (au.raw_user_meta_data->>'username')::text,
    au.email,
    'user_' || SUBSTRING(au.id::text, 1, 8)
  ) as username,
  COALESCE(
    (au.raw_user_meta_data->>'username')::text,
    au.email,
    'User ' || SUBSTRING(au.id::text, 1, 8)
  ) as display_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ===== SCHEMA VALIDATION =====
-- Verify that all required tables exist
DO $$
BEGIN
  -- Check if all required tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items') THEN
    RAISE EXCEPTION 'Items table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Profiles table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    RAISE EXCEPTION 'Offers table not created';
  END IF;
  
  -- Check if RLS is enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'items' AND rowsecurity = true) THEN
    RAISE EXCEPTION 'RLS not enabled on items table';
  END IF;
  
  RAISE NOTICE 'Database schema successfully created and validated!';
  RAISE NOTICE 'Joynest e-commerce platform is ready for use.';
END $$;
