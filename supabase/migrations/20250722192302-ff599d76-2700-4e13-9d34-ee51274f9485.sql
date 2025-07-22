
-- Fix infinite recursion in RLS policies by removing self-referencing policies
-- and creating simpler, non-recursive admin policies

-- First, drop the problematic recursive policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct check against auth.uid() without referencing profiles table
  RETURN auth.uid() IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email IN ('msmsasandadinah@gmail.com', 'projectglo2024@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new non-recursive admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin_user());

-- Also fix any other recursive policies that might exist
-- Remove and recreate admin policies for other tables to use the same function

-- Update resources admin policy
DROP POLICY IF EXISTS "Admins can manage all resources" ON public.resources;
CREATE POLICY "Admins can manage all resources" ON public.resources
  FOR ALL USING (public.is_admin_user());

-- Update blog_posts admin policy  
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
  FOR ALL USING (public.is_admin_user());

-- Update other admin policies to use the same approach
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.user_assessments;
CREATE POLICY "Admins can view all assessments" ON public.user_assessments
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage all providers" ON public.service_providers;
CREATE POLICY "Admins can manage all providers" ON public.service_providers
  FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all matches" ON public.match_logs;
CREATE POLICY "Admins can view all matches" ON public.match_logs
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage reports" ON public.admin_reports;
CREATE POLICY "Admins can manage reports" ON public.admin_reports
  FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests_tracking;
CREATE POLICY "Admins can view all service requests" ON public.service_requests_tracking
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all chat interactions" ON public.chat_interactions;
CREATE POLICY "Admins can view all chat interactions" ON public.chat_interactions
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all usage stats" ON public.usage_stats;
CREATE POLICY "Admins can view all usage stats" ON public.usage_stats
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
CREATE POLICY "Admins can view all support requests" ON public.support_requests
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage chatbot intents" ON public.chatbot_intents;
CREATE POLICY "Admins can manage chatbot intents" ON public.chatbot_intents
  FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage service schedules" ON public.service_schedule;
CREATE POLICY "Admins can manage service schedules" ON public.service_schedule
  FOR ALL USING (public.is_admin_user());

-- Fix team_members admin policy to use the new function
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (public.is_admin_user());
