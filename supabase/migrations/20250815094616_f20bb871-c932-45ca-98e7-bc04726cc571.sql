
-- Implement comprehensive RLS policies for all tables
-- This fixes the critical security issue where tables have RLS enabled but no policies

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (is_admin_user());

-- Contact submissions policies  
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
FOR UPDATE USING (is_admin_user());

-- Support requests policies
CREATE POLICY "Anyone can create support requests" ON public.support_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all support requests" ON public.support_requests
FOR SELECT USING (is_admin_user());

-- Services policies
CREATE POLICY "Anyone can view available services" ON public.services
FOR SELECT USING (availability = 'Available');

CREATE POLICY "Admins can manage services" ON public.services
FOR ALL USING (is_admin_user());

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
FOR ALL USING (is_admin_user());

-- Blog categories policies
CREATE POLICY "Public can view blog categories" ON public.blog_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories
FOR ALL USING (is_admin_user());

-- Site content policies
CREATE POLICY "Anyone can view published content" ON public.site_content
FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all content" ON public.site_content
FOR ALL USING (is_admin_user());

-- Resources policies
CREATE POLICY "Anyone can view published resources" ON public.resources
FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all resources" ON public.resources
FOR ALL USING (is_admin_user());

-- Employer profiles policies
CREATE POLICY "Employers can view own profile" ON public.employer_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can insert own profile" ON public.employer_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can update own profile" ON public.employer_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all employer profiles" ON public.employer_profiles
FOR ALL USING (is_admin_user());

-- Job postings policies (assuming this table exists)
CREATE POLICY "Anyone can view active job postings" ON public.job_postings
FOR SELECT USING (status = 'active');

CREATE POLICY "Employers can manage their own job postings" ON public.job_postings
FOR ALL USING (employer_id IN (
  SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all job postings" ON public.job_postings
FOR ALL USING (is_admin_user());

-- Job applicants policies
CREATE POLICY "Anyone can apply to jobs" ON public.job_applicants
FOR INSERT WITH CHECK (true);

CREATE POLICY "Applicants can view their own applications" ON public.job_applicants
FOR SELECT USING (applicant_user_id = auth.uid());

CREATE POLICY "Employers can view applicants for their jobs" ON public.job_applicants
FOR SELECT USING (job_posting_id IN (
  SELECT jp.id FROM job_postings jp
  JOIN employer_profiles ep ON jp.employer_id = ep.id
  WHERE ep.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all applications" ON public.job_applicants
FOR ALL USING (is_admin_user());

-- Job payments policies
CREATE POLICY "Employers can view own payments" ON public.job_payments
FOR SELECT USING (employer_id IN (
  SELECT id FROM employer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Employers can insert own payments" ON public.job_payments
FOR INSERT WITH CHECK (employer_id IN (
  SELECT id FROM employer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can update payments" ON public.job_payments
FOR UPDATE USING (true);

CREATE POLICY "Admins can manage all payments" ON public.job_payments
FOR ALL USING (is_admin_user());

-- Job renewals policies
CREATE POLICY "Employers can view own renewals" ON public.job_renewals
FOR SELECT USING (job_posting_id IN (
  SELECT jp.id FROM job_postings jp
  JOIN employer_profiles ep ON jp.employer_id = ep.id
  WHERE ep.user_id = auth.uid()
));

CREATE POLICY "System can insert renewals" ON public.job_renewals
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all renewals" ON public.job_renewals
FOR ALL USING (is_admin_user());

-- Service bookings policies
CREATE POLICY "Users can view their own bookings" ON public.service_bookings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.service_bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.service_bookings
FOR UPDATE USING (auth.uid() = user_id);

-- Service schedule policies
CREATE POLICY "Anyone can view service schedules" ON public.service_schedule
FOR SELECT USING (true);

CREATE POLICY "Admins can manage service schedules" ON public.service_schedule
FOR ALL USING (is_admin_user());

-- Chat interactions policies
CREATE POLICY "Users can view their own chat interactions" ON public.chat_interactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat interactions" ON public.chat_interactions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all chat interactions" ON public.chat_interactions
FOR SELECT USING (is_admin_user());

-- Security logs policies (admin only)
CREATE POLICY "Only admins can view security logs" ON public.security_logs
FOR SELECT USING (is_admin_user());

CREATE POLICY "System can insert security logs" ON public.security_logs
FOR INSERT WITH CHECK (true);

-- Rate limits policies
CREATE POLICY "Only admins can view rate limits" ON public.rate_limits
FOR SELECT USING (is_admin_user());

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL WITH CHECK (true);

-- Admin reports policies
CREATE POLICY "Admins can manage reports" ON public.admin_reports
FOR ALL USING (is_admin_user());

-- Team members policies
CREATE POLICY "Users can view their own team membership" ON public.team_members
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage team members" ON public.team_members
FOR ALL USING (is_admin_user());

-- User assessments policies
CREATE POLICY "Users can view their own assessments" ON public.user_assessments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessments" ON public.user_assessments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all assessments" ON public.user_assessments
FOR SELECT USING (is_admin_user());

-- Service requests tracking policies
CREATE POLICY "Users can view their own service requests" ON public.service_requests_tracking
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own service requests" ON public.service_requests_tracking
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own service requests" ON public.service_requests_tracking
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all service requests" ON public.service_requests_tracking
FOR SELECT USING (is_admin_user());

-- Service requests policies
CREATE POLICY "Users can view their own service requests" ON public.service_requests
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own service requests" ON public.service_requests
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "NGOs can view service requests assigned to them" ON public.service_requests
FOR SELECT USING (ngo_id IN (
  SELECT id FROM ngo_details WHERE user_id = auth.uid()
));

CREATE POLICY "NGOs can update their service requests" ON public.service_requests
FOR UPDATE USING (ngo_id IN (
  SELECT id FROM ngo_details WHERE user_id = auth.uid()
));

-- User concerns policies
CREATE POLICY "Users can view their own concerns" ON public.user_concerns
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own concerns" ON public.user_concerns
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caseworkers can view assigned concerns" ON public.user_concerns
FOR SELECT USING (
  assigned_caseworker = auth.uid() OR 
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
);

CREATE POLICY "Caseworkers can update assigned concerns" ON public.user_concerns
FOR UPDATE USING (
  assigned_caseworker = auth.uid() OR 
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
);

-- User needs policies
CREATE POLICY "Users can manage their own needs" ON public.user_needs
FOR ALL USING (user_id = auth.uid());

-- Progress notes policies
CREATE POLICY "Users can view their own progress notes" ON public.progress_notes
FOR SELECT USING (
  user_id = auth.uid() OR 
  caseworker_id = auth.uid() OR 
  (visibility = 'public' AND user_id = auth.uid())
);

CREATE POLICY "Caseworkers can create progress notes" ON public.progress_notes
FOR INSERT WITH CHECK (
  caseworker_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
);

CREATE POLICY "Caseworkers can update their own progress notes" ON public.progress_notes
FOR UPDATE USING (
  caseworker_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
FOR SELECT USING (user_id = auth.uid() OR caseworker_id = auth.uid());

CREATE POLICY "Users can create their own appointments" ON public.appointments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caseworkers can manage their appointments" ON public.appointments
FOR ALL USING (
  caseworker_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
);

-- Allocated resources policies
CREATE POLICY "Users can view their allocated resources" ON public.allocated_resources
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can manage resource allocation" ON public.allocated_resources
FOR ALL USING (
  EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
);

-- Service providers policies
CREATE POLICY "Anyone can view verified providers" ON public.service_providers
FOR SELECT USING (verification_status = 'verified' AND is_active = true);

CREATE POLICY "NGOs can manage their own provider profiles" ON public.service_providers
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all providers" ON public.service_providers
FOR ALL USING (is_admin_user());

-- User feedback policies
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own feedback" ON public.user_feedback
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
FOR SELECT USING (is_admin_user());

-- Match logs policies
CREATE POLICY "Users can view their own matches" ON public.match_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service providers can view matches assigned to them" ON public.service_providers
FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_providers WHERE id = match_logs.provider_id AND created_by = auth.uid())
);

CREATE POLICY "Service providers can update their match responses" ON public.match_logs
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_providers WHERE id = match_logs.provider_id AND created_by = auth.uid())
);

CREATE POLICY "System can create matches" ON public.match_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all matches" ON public.match_logs
FOR SELECT USING (is_admin_user());

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- NGO details policies
CREATE POLICY "NGOs can manage their own details" ON public.ngo_details
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view verified NGOs" ON public.ngo_details
FOR SELECT USING (verified = true);

-- Usage stats policies
CREATE POLICY "Users can view their own usage stats" ON public.usage_stats
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert usage stats" ON public.usage_stats
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all usage stats" ON public.usage_stats
FOR SELECT USING (is_admin_user());

-- Donations policies
CREATE POLICY "Only admins can view donations" ON public.donations
FOR SELECT USING (is_admin_user());

CREATE POLICY "Only admins can insert donations" ON public.donations
FOR INSERT WITH CHECK (is_admin_user());

CREATE POLICY "Only admins can update donations" ON public.donations
FOR UPDATE USING (is_admin_user());

CREATE POLICY "Only admins can delete donations" ON public.donations
FOR DELETE USING (is_admin_user());

-- Chatbot intents policies
CREATE POLICY "Anyone can view chatbot intents" ON public.chatbot_intents
FOR SELECT USING (true);

CREATE POLICY "Admins can manage chatbot intents" ON public.chatbot_intents
FOR ALL USING (is_admin_user());
