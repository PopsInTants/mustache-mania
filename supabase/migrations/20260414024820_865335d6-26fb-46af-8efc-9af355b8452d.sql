
-- Create mustaches table
CREATE TABLE public.mustaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  submitter_name TEXT NOT NULL DEFAULT 'Anonymous',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mustache_id UUID NOT NULL REFERENCES public.mustaches(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  voter_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (mustache_id, voter_ip)
);

-- Enable RLS
ALTER TABLE public.mustaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Mustaches: anyone can view and insert
CREATE POLICY "Anyone can view mustaches" ON public.mustaches FOR SELECT USING (true);
CREATE POLICY "Anyone can submit mustaches" ON public.mustaches FOR INSERT WITH CHECK (true);

-- Ratings: anyone can view and insert
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can submit ratings" ON public.ratings FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_ratings_mustache_id ON public.ratings(mustache_id);
CREATE INDEX idx_mustaches_created_at ON public.mustaches(created_at DESC);

-- Create a view for average ratings
CREATE OR REPLACE VIEW public.mustache_stats AS
SELECT
  m.id,
  m.title,
  m.submitter_name,
  m.image_url,
  m.created_at,
  COALESCE(AVG(r.score), 0) as avg_rating,
  COUNT(r.id) as total_ratings
FROM public.mustaches m
LEFT JOIN public.ratings r ON r.mustache_id = m.id
GROUP BY m.id;

-- Storage bucket for mustache images
INSERT INTO storage.buckets (id, name, public) VALUES ('mustache-uploads', 'mustache-uploads', true);

-- Storage policies
CREATE POLICY "Anyone can view mustache images" ON storage.objects FOR SELECT USING (bucket_id = 'mustache-uploads');
CREATE POLICY "Anyone can upload mustache images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mustache-uploads');
