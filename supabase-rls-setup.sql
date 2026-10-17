-- ====================================================================
-- ScholarHub Supabase Row Level Security (RLS) Configuration
-- Run this in the Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. SAVED APPLICATIONS / BOOKMARKS TABLE
-- --------------------------------------------------------------------
-- Ensure RLS is enabled on saved_applications
alter table public.saved_applications enable row level security;

-- Drop existing policies if any exist
drop policy if exists "Users can view their own saved applications." on public.saved_applications;
drop policy if exists "Users can insert their own saved applications." on public.saved_applications;
drop policy if exists "Users can update their own saved applications." on public.saved_applications;
drop policy if exists "Users can delete their own saved applications." on public.saved_applications;

-- Policy: SELECT (Users can only read their own bookmarked applications)
create policy "Users can view their own saved applications." 
  on public.saved_applications for select 
  using (auth.uid() = user_id);

-- Policy: INSERT (Users can only insert bookmarks for their own user_id)
create policy "Users can insert their own saved applications." 
  on public.saved_applications for insert 
  with check (auth.uid() = user_id);

-- Policy: UPDATE (Essential for updating Tracker status e.g. In Progress/Submitted and notes)
create policy "Users can update their own saved applications." 
  on public.saved_applications for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: DELETE (Users can remove their own saved applications)
create policy "Users can delete their own saved applications." 
  on public.saved_applications for delete 
  using (auth.uid() = user_id);


-- 2. USER PROFILES TABLE
-- --------------------------------------------------------------------
-- Ensure RLS is enabled on profiles
alter table public.profiles enable row level security;

-- Drop existing policies if any exist
drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;

-- Policy: SELECT (Users can read their own profile row)
create policy "Users can view their own profile." 
  on public.profiles for select 
  using (auth.uid() = id);

-- Policy: INSERT (Users can create their initial profile)
create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Policy: UPDATE (Users can update their GPA, major, education stage)
create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id)
  with check (auth.uid() = id);
