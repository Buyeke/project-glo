-- Create ai_model_metrics table for tracking AI performance
CREATE TABLE IF NOT EXISTS public.ai_model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_interaction_id UUID REFERENCES public.chat_interactions(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  request_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_time_ms INTEGER NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  request_success BOOLEAN NOT NULL DEFAULT true,
  error_type TEXT,
  error_message TEXT,
  model_parameters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chatbot_feedback table for user satisfaction tracking
CREATE TABLE IF NOT EXISTS public.chatbot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  chat_interaction_id UUID REFERENCES public.chat_interactions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'accurate', 'inaccurate', 'culturally_appropriate', 'needs_improvement')),
  comment TEXT,
  response_relevance INTEGER CHECK (response_relevance >= 1 AND response_relevance <= 5),
  language_quality INTEGER CHECK (language_quality >= 1 AND language_quality <= 5),
  cultural_sensitivity INTEGER CHECK (cultural_sensitivity >= 1 AND cultural_sensitivity <= 5),
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to chat_interactions table
ALTER TABLE public.chat_interactions 
  ADD COLUMN IF NOT EXISTS ai_model_metric_id UUID REFERENCES public.ai_model_metrics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS emotional_state TEXT,
  ADD COLUMN IF NOT EXISTS requires_human_intervention BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_status TEXT DEFAULT 'none' CHECK (follow_up_status IN ('none', 'recommended', 'scheduled', 'completed')),
  ADD COLUMN IF NOT EXISTS trauma_indicators_detected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS safety_concerns BOOLEAN DEFAULT false;

-- Create performance summary view for analytics
CREATE OR REPLACE VIEW public.ai_performance_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  model_name,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE request_success = true) as successful_requests,
  COUNT(*) FILTER (WHERE request_success = false) as failed_requests,
  ROUND(AVG(response_time_ms)::numeric, 2) as avg_response_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time_ms,
  ROUND(AVG(total_tokens)::numeric, 2) as avg_tokens,
  SUM(total_tokens) as total_tokens_sum,
  ROUND(SUM(estimated_cost_usd)::numeric, 4) as total_cost_usd
FROM public.ai_model_metrics
GROUP BY date, model_name
ORDER BY date DESC;

-- Enable RLS on new tables
ALTER TABLE public.ai_model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_model_metrics
CREATE POLICY "Users can view their own AI metrics"
  ON public.ai_model_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all AI metrics"
  ON public.ai_model_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert metrics"
  ON public.ai_model_metrics FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update metrics"
  ON public.ai_model_metrics FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for chatbot_feedback
CREATE POLICY "Users can view their own feedback"
  ON public.chatbot_feedback FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can submit feedback"
  ON public.chatbot_feedback FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all feedback"
  ON public.chatbot_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_user_id ON public.ai_model_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_created_at ON public.ai_model_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_chat_interaction ON public.ai_model_metrics(chat_interaction_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_user_id ON public.chatbot_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_created_at ON public.chatbot_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_rating ON public.chatbot_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_urgency ON public.chat_interactions(urgency_level) WHERE urgency_level IS NOT NULL;