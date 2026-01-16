-- Add message reactions table
CREATE TABLE public.message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, profile_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages in their conversations
CREATE POLICY "Users can view reactions in their conversations" 
ON public.message_reactions 
FOR SELECT 
USING (message_id IN (
    SELECT dm.id FROM direct_messages dm
    JOIN conversations c ON dm.conversation_id = c.id
    WHERE c.participant_one IN (SELECT id FROM profiles WHERE user_id = auth.uid())
       OR c.participant_two IN (SELECT id FROM profiles WHERE user_id = auth.uid())
));

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND message_id IN (
        SELECT dm.id FROM direct_messages dm
        JOIN conversations c ON dm.conversation_id = c.id
        WHERE c.participant_one IN (SELECT id FROM profiles WHERE user_id = auth.uid())
           OR c.participant_two IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add reply_to_id to direct_messages for reply functionality
ALTER TABLE public.direct_messages 
ADD COLUMN reply_to_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL;

-- Add file attachment columns to direct_messages
ALTER TABLE public.direct_messages
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;

-- Add bio column to profiles for profile page
ALTER TABLE public.profiles
ADD COLUMN bio TEXT;

-- Create group_chats table
CREATE TABLE public.group_chats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    photo_url TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(group_id, profile_id)
);

-- Create group_messages table
CREATE TABLE public.group_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Group chats policies
CREATE POLICY "Users can view groups they are members of"
ON public.group_chats FOR SELECT
USING (id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can create groups"
ON public.group_chats FOR INSERT
WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Group admins can update groups"
ON public.group_chats FOR UPDATE
USING (id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND role = 'admin'));

-- Group members policies
CREATE POLICY "Users can view group members"
ON public.group_members FOR SELECT
USING (group_id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Group admins can add members"
ON public.group_members FOR INSERT
WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND role = 'admin'));

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Group messages policies
CREATE POLICY "Users can view group messages"
ON public.group_messages FOR SELECT
USING (group_id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can send group messages"
ON public.group_messages FOR INSERT
WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND group_id IN (SELECT group_id FROM group_members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can update their own group messages"
ON public.group_messages FOR UPDATE
USING (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true);

-- Storage policies for chat files
CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;