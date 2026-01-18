-- Add is_delivered column to direct_messages for WhatsApp-like indicators
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS is_delivered boolean DEFAULT false;

-- Create a video_calls table for tracking call sessions
CREATE TABLE IF NOT EXISTS public.video_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  callee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_name text NOT NULL UNIQUE,
  call_type text NOT NULL DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
  status text NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'answered', 'ended', 'missed', 'declined')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on video_calls
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_calls
CREATE POLICY "Users can view their own calls"
ON public.video_calls FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = caller_id
  UNION
  SELECT user_id FROM profiles WHERE id = callee_id
));

CREATE POLICY "Users can create calls"
ON public.video_calls FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = caller_id));

CREATE POLICY "Users can update their own calls"
ON public.video_calls FOR UPDATE
USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = caller_id
  UNION
  SELECT user_id FROM profiles WHERE id = callee_id
));

-- Enable realtime for video_calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;