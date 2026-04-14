
CREATE OR REPLACE VIEW public.mustache_stats
WITH (security_invoker = on) AS
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
