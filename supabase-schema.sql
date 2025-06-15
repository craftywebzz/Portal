-- Complete NST Dev Club Portal Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Note: Supabase automatically creates the auth.users table
-- We'll create additional tables to extend user functionality

-- =====================================================
-- 1. USER PROFILES TABLE (Enhanced)
-- =====================================================

-- User profiles table (extends the default auth.users table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'mentor')),
  batch TEXT,
  reward_points INTEGER DEFAULT 0,
  github_username TEXT,
  discord_username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  bio TEXT,
  skills TEXT[], -- Array of skills
  linkedin_url TEXT,
  portfolio_url TEXT,
  phone TEXT,
  year_of_study INTEGER,
  department TEXT,
  github_last_updated TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. GITHUB STATS TABLE
-- =====================================================

-- Store cached GitHub statistics for users
CREATE TABLE IF NOT EXISTS public.github_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  public_repos INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  total_forks INTEGER DEFAULT 0,
  total_commits_last_year INTEGER DEFAULT 0,
  top_languages JSONB DEFAULT '[]'::jsonb, -- [{"name": "JavaScript", "percentage": 45}]
  contribution_streak INTEGER DEFAULT 0,
  last_contribution_date DATE,
  profile_data JSONB DEFAULT '{}'::jsonb, -- Full GitHub profile data
  repositories JSONB DEFAULT '[]'::jsonb, -- Repository data
  last_fetched TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, github_username)
);

-- =====================================================
-- 3. PROJECTS TABLE
-- =====================================================

-- Projects managed by the dev club
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numeric_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  github_repo_url TEXT,
  live_demo_url TEXT,
  tech_stack TEXT[], -- Array of technologies
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  github_issues INTEGER DEFAULT 0,
  github_prs INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  project_lead UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[], -- Project tags for categorization
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add numeric_id column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'numeric_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN numeric_id BIGINT UNIQUE;
  END IF;
END $$;

-- Create index on numeric_id
CREATE INDEX IF NOT EXISTS projects_numeric_id_idx ON public.projects(numeric_id);

-- =====================================================
-- 4. PROJECT MEMBERS TABLE
-- =====================================================

-- Track project team members and their roles
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'co-lead', 'member', 'contributor', 'mentor')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  contribution_hours INTEGER DEFAULT 0,
  contribution_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- =====================================================
-- 5. MEETINGS TABLE
-- =====================================================

-- Club meetings and events
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT DEFAULT 'general' CHECK (meeting_type IN ('general', 'project', 'workshop', 'presentation', 'social')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT NOT NULL,
  meeting_link TEXT, -- Zoom/Google Meet link
  max_attendees INTEGER,
  is_mandatory BOOLEAN DEFAULT FALSE,
  attendance_open BOOLEAN DEFAULT FALSE,
  attendance_code TEXT, -- Code for marking attendance
  agenda TEXT,
  notes TEXT, -- Meeting notes/minutes
  recording_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id), -- If project-specific meeting
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. ATTENDANCE TABLE
-- =====================================================

-- Track meeting attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  marked_by UUID REFERENCES public.profiles(id), -- Who marked the attendance
  notes TEXT,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- 7. CONTRIBUTIONS TABLE
-- =====================================================

-- Track GitHub contributions and activities
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('commit', 'pr', 'issue', 'review', 'release', 'fork', 'star')),
  github_url TEXT, -- Link to the contribution
  title TEXT,
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  github_data JSONB DEFAULT '{}'::jsonb, -- Raw GitHub API data
  contribution_date DATE NOT NULL,
  repository_name TEXT,
  repository_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. REWARDS TABLE
-- =====================================================

-- Track reward point transactions
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('contribution', 'attendance', 'project_completion', 'mentoring', 'event_participation', 'manual', 'penalty')),
  reference_id UUID, -- Can reference meeting_id, project_id, contribution_id, etc.
  reference_type TEXT, -- 'meeting', 'project', 'contribution', etc.
  awarded_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. NOTIFICATIONS TABLE
-- =====================================================

-- System notifications for users
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'reminder')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT, -- URL to navigate when notification is clicked
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. MEETING INVITES TABLE
-- =====================================================

-- Track meeting invitations
CREATE TABLE IF NOT EXISTS public.meeting_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'maybe')),
  invited_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_github_username_idx ON public.profiles(github_username);
CREATE INDEX IF NOT EXISTS profiles_batch_idx ON public.profiles(batch);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON public.profiles(is_active);

-- GitHub stats indexes
CREATE INDEX IF NOT EXISTS github_stats_user_id_idx ON public.github_stats(user_id);
CREATE INDEX IF NOT EXISTS github_stats_github_username_idx ON public.github_stats(github_username);
CREATE INDEX IF NOT EXISTS github_stats_last_fetched_idx ON public.github_stats(last_fetched);

-- Projects indexes
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS projects_project_lead_idx ON public.projects(project_lead);
CREATE INDEX IF NOT EXISTS projects_is_public_idx ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS projects_difficulty_level_idx ON public.projects(difficulty_level);

-- Project members indexes
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS project_members_is_active_idx ON public.project_members(is_active);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS meetings_date_idx ON public.meetings(date);
CREATE INDEX IF NOT EXISTS meetings_created_by_idx ON public.meetings(created_by);
CREATE INDEX IF NOT EXISTS meetings_project_id_idx ON public.meetings(project_id);
CREATE INDEX IF NOT EXISTS meetings_meeting_type_idx ON public.meetings(meeting_type);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS attendance_meeting_id_idx ON public.attendance(meeting_id);
CREATE INDEX IF NOT EXISTS attendance_user_id_idx ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS attendance_status_idx ON public.attendance(status);

-- Contributions indexes
CREATE INDEX IF NOT EXISTS contributions_user_id_idx ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS contributions_project_id_idx ON public.contributions(project_id);
CREATE INDEX IF NOT EXISTS contributions_type_idx ON public.contributions(contribution_type);
CREATE INDEX IF NOT EXISTS contributions_date_idx ON public.contributions(contribution_date);

-- Rewards indexes
CREATE INDEX IF NOT EXISTS rewards_user_id_idx ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS rewards_type_idx ON public.rewards(reward_type);
CREATE INDEX IF NOT EXISTS rewards_is_active_idx ON public.rewards(is_active);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(notification_type);

-- Meeting invites indexes
CREATE INDEX IF NOT EXISTS meeting_invites_meeting_id_idx ON public.meeting_invites(meeting_id);
CREATE INDEX IF NOT EXISTS meeting_invites_user_id_idx ON public.meeting_invites(user_id);
CREATE INDEX IF NOT EXISTS meeting_invites_status_idx ON public.meeting_invites(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Essential ones)
-- =====================================================

DO $$ 
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- GitHub stats policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'github_stats' AND policyname = 'Public github stats are viewable by everyone') THEN
    CREATE POLICY "Public github stats are viewable by everyone" ON public.github_stats FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'github_stats' AND policyname = 'Users can manage own github stats') THEN
    CREATE POLICY "Users can manage own github stats" ON public.github_stats FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Projects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Public projects are viewable by everyone') THEN
    CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (is_public = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Only admins can create and manage projects') THEN
    CREATE POLICY "Only admins can create and manage projects" ON public.projects FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Project members policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Project members can view project memberships') THEN
    CREATE POLICY "Project members can view project memberships" ON public.project_members FOR SELECT USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Only admins can manage project memberships') THEN
    CREATE POLICY "Only admins can manage project memberships" ON public.project_members FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Meetings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Everyone can view meetings') THEN
    CREATE POLICY "Everyone can view meetings" ON public.meetings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Only admins can create and manage meetings') THEN
    CREATE POLICY "Only admins can create and manage meetings" ON public.meetings FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Attendance policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Users can view attendance for their meetings') THEN
    CREATE POLICY "Users can view attendance for their meetings" ON public.attendance FOR SELECT USING (
      -- User is invited to the meeting
      EXISTS (SELECT 1 FROM public.meeting_invites WHERE meeting_id = attendance.meeting_id AND user_id = auth.uid())
      OR
      -- User is an admin
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Only admins can manage attendance') THEN
    CREATE POLICY "Only admins can manage attendance" ON public.attendance FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Contributions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contributions' AND policyname = 'Users can view own contributions') THEN
    CREATE POLICY "Users can view own contributions" ON public.contributions FOR SELECT USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contributions' AND policyname = 'Only admins can manage contributions') THEN
    CREATE POLICY "Only admins can manage contributions" ON public.contributions FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Rewards policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Users can view own rewards') THEN
    CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Only admins can manage rewards') THEN
    CREATE POLICY "Only admins can manage rewards" ON public.rewards FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Notifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Only admins can create notifications') THEN
    CREATE POLICY "Only admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  -- Meeting invites policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_invites' AND policyname = 'Users can view own invites') THEN
    CREATE POLICY "Users can view own invites" ON public.meeting_invites FOR SELECT USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_invites' AND policyname = 'Only admins can manage invites') THEN
    CREATE POLICY "Only admins can manage invites" ON public.meeting_invites FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- =====================================================
-- TRIGGERS (at the end of the file)
-- =====================================================

-- Note: Supabase automatically handles updated_at timestamps
-- No need for explicit triggers as they are managed by Supabase
-- The updated_at column will be automatically updated by Supabase

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, github_username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth trigger only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE c.relname = 'users' 
        AND t.tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Function to calculate reward points for a user
CREATE OR REPLACE FUNCTION public.calculate_user_reward_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO total_points
  FROM public.rewards
  WHERE user_id = user_uuid AND is_active = true;

  RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reward points
CREATE OR REPLACE FUNCTION public.update_user_reward_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's total reward points
  UPDATE public.profiles
  SET reward_points = public.calculate_user_reward_points(NEW.user_id)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create reward triggers only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE c.relname = 'rewards' 
        AND t.tgname = 'update_reward_points_on_insert'
    ) THEN
        CREATE TRIGGER update_reward_points_on_insert
            AFTER INSERT ON public.rewards
            FOR EACH ROW EXECUTE FUNCTION public.update_user_reward_points();
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE c.relname = 'rewards' 
        AND t.tgname = 'update_reward_points_on_update'
    ) THEN
        CREATE TRIGGER update_reward_points_on_update
            AFTER UPDATE ON public.rewards
            FOR EACH ROW EXECUTE FUNCTION public.update_user_reward_points();
    END IF;
END $$;

-- Function to generate attendance code
CREATE OR REPLACE FUNCTION public.generate_attendance_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 6));
END;
$$ LANGUAGE plpgsql;

-- Function to award points for attendance
CREATE OR REPLACE FUNCTION public.award_attendance_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Award points for attendance (only for 'present' status)
  IF NEW.status = 'present' THEN
    INSERT INTO public.rewards (user_id, points, reason, reward_type, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      10, -- 10 points for attendance
      'Meeting attendance: ' || (SELECT title FROM public.meetings WHERE id = NEW.meeting_id),
      'attendance',
      NEW.meeting_id,
      'meeting'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create attendance trigger only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE c.relname = 'attendance' 
        AND t.tgname = 'award_attendance_points_trigger'
    ) THEN
        CREATE TRIGGER award_attendance_points_trigger
            AFTER INSERT ON public.attendance
            FOR EACH ROW EXECUTE FUNCTION public.award_attendance_points();
    END IF;
END $$;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

-- Enable realtime for tables only if they're not already enabled
DO $$ 
BEGIN
    -- Profiles
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;

    -- GitHub stats
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'github_stats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.github_stats;
    END IF;

    -- Projects
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    END IF;

    -- Project members
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'project_members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
    END IF;

    -- Meetings
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'meetings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
    END IF;

    -- Attendance
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'attendance'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
    END IF;

    -- Contributions
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'contributions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
    END IF;

    -- Rewards
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'rewards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards;
    END IF;

    -- Notifications
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;

    -- Meeting invites
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'meeting_invites'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_invites;
    END IF;
END $$;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample admin user (you can modify this)
-- INSERT INTO public.profiles (id, username, full_name, role, is_admin, github_username, batch)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
--   'admin',
--   'Admin User',
--   'admin',
--   true,
--   'admin-github',
--   '2024'
-- );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user statistics
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.github_username,
  p.batch,
  p.reward_points,
  gs.public_repos,
  gs.total_stars,
  gs.total_commits_last_year,
  gs.top_languages,
  COUNT(DISTINCT pm.project_id) as project_count,
  COUNT(DISTINCT a.meeting_id) as meetings_attended,
  COUNT(DISTINCT c.id) as total_contributions
FROM public.profiles p
LEFT JOIN public.github_stats gs ON p.id = gs.user_id
LEFT JOIN public.project_members pm ON p.id = pm.user_id AND pm.is_active = true
LEFT JOIN public.attendance a ON p.id = a.user_id AND a.status = 'present'
LEFT JOIN public.contributions c ON p.id = c.user_id
WHERE p.is_active = true
GROUP BY p.id, p.username, p.full_name, p.github_username, p.batch, p.reward_points,
         gs.public_repos, gs.total_stars, gs.total_commits_last_year, gs.top_languages;

-- View for project statistics
CREATE OR REPLACE VIEW public.project_stats AS
SELECT
  p.id,
  p.name,
  p.status,
  p.tech_stack,
  p.github_stars,
  p.github_forks,
  COUNT(DISTINCT pm.user_id) as member_count,
  COUNT(DISTINCT c.id) as contribution_count,
  AVG(pm.contribution_hours) as avg_contribution_hours
FROM public.projects p
LEFT JOIN public.project_members pm ON p.id = pm.project_id AND pm.is_active = true
LEFT JOIN public.contributions c ON p.id = c.project_id
WHERE p.is_public = true
GROUP BY p.id, p.name, p.status, p.tech_stack, p.github_stars, p.github_forks;
