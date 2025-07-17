-- Create the items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
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
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS offers_item_id_idx ON offers(item_id);
CREATE INDEX IF NOT EXISTS offers_user_id_idx ON offers(user_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Authenticated users can insert offers (but not on their own items)
CREATE POLICY "Users can insert offers on others' items" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() != (
      SELECT user_id FROM items WHERE id = offers.item_id
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

-- Function to handle new user registration (creates profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== TESTING HELPERS =====
-- Function to create test users easily (for development/testing only)
CREATE OR REPLACE FUNCTION create_test_user(
  test_email TEXT,
  test_password TEXT DEFAULT 'password123',
  test_username TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  username_to_use TEXT;
BEGIN
  -- Generate username if not provided
  username_to_use := COALESCE(test_username, SPLIT_PART(test_email, '@', 1));
  
  -- This is a simplified test function
  -- In production, use proper Supabase Auth registration
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_confirm_status
  ) VALUES (
    gen_random_uuid(),
    test_email,
    crypt(test_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    1
  ) RETURNING id INTO new_user_id;
  
  -- Create profile with username
  INSERT INTO profiles (id, username, full_name) VALUES (
    new_user_id,
    username_to_use,
    INITCAP(REPLACE(username_to_use, '_', ' '))
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Quick reset function for testing
CREATE OR REPLACE FUNCTION reset_test_data()
RETURNS TEXT AS $$
BEGIN
  -- Clear all data (be careful!)
  DELETE FROM offers;
  DELETE FROM items;
  DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
  DELETE FROM auth.users WHERE email LIKE '%@test.com';
  
  RETURN 'Test data cleared!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
