-- Seed stories for demo
INSERT INTO public.stories (user_id, type, thumbnail_label, content)
SELECT
  id,
  unnest(ARRAY['screenshot'::text, 'stripe'::text, 'video'::text, 'screenshot'::text, 'stripe'::text]),
  unnest(ARRAY['Dashboard', 'Stripe', 'Demo', 'Users', 'Revenue']),
  unnest(ARRAY[
    'Monthly revenue hit $8.2K — 22% MoM growth',
    'First $1K MRR milestone achieved!',
    'New product demo walkthrough — would love feedback',
    'Crossed 500 active users this week',
    'Q2 revenue tracking 40% above forecast'
  ])
FROM public.profiles
WHERE handle = 'scaletrek'
ON CONFLICT DO NOTHING;
