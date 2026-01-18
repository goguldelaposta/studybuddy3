-- Create notes table for sharing study materials
CREATE TABLE public.notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    faculty TEXT,
    year INTEGER,
    file_url TEXT,
    user_id UUID NOT NULL,
    downloads INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for notes
CREATE POLICY "Anyone authenticated can view notes" 
ON public.notes FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create notes" 
ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.notes FOR DELETE 
USING (auth.uid() = user_id);

-- Create exams table for session calendar
CREATE TABLE public.exams (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    faculty TEXT NOT NULL,
    year INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS policies for exams
CREATE POLICY "Anyone authenticated can view exams" 
ON public.exams FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create exams" 
ON public.exams FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exams" 
ON public.exams FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exams" 
ON public.exams FOR DELETE 
USING (auth.uid() = created_by);

-- Create storage bucket for notes files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes-files', 'notes-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for notes-files bucket
CREATE POLICY "Anyone can view notes files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'notes-files');

CREATE POLICY "Authenticated users can upload notes files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'notes-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notes files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'notes-files' AND auth.uid()::text = (storage.foldername(name))[1]);