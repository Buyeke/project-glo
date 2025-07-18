
-- Create followup_actions table for proactive follow-ups
CREATE TABLE public.followup_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('check_in', 'appointment_reminder', 'resource_suggestion', 'emergency_check')),
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  data JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.followup_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for followup_actions
CREATE POLICY "Users can view their own followup actions" 
  ON public.followup_actions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own followup actions" 
  ON public.followup_actions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own followup actions" 
  ON public.followup_actions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own followup actions" 
  ON public.followup_actions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create knowledge_base table for RAG implementation
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for knowledge_base
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy for knowledge_base (public read access)
CREATE POLICY "Anyone can view knowledge base" 
  ON public.knowledge_base 
  FOR SELECT 
  USING (true);

-- Create policy for admins to manage knowledge base
CREATE POLICY "Admins can manage knowledge base" 
  ON public.knowledge_base 
  FOR ALL 
  USING (EXISTS ( 
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  ));
