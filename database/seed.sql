INSERT INTO score_versions (version_label, methodology_summary, status, created_by, published_at)
VALUES (
  '2026.06.sample',
  'Sample seed based on India-specific metro concentration, sector, education, skill, tech adoption, remote feasibility, and growth outlook rubric.',
  'PUBLISHED',
  'sample-seed',
  '2026-06-25T00:00:00Z'
)
ON CONFLICT (version_label) DO NOTHING;

INSERT INTO data_sources (source_name, source_type, source_url, publisher, accessed_at, reliability_score)
VALUES (
  'Analyst sample seed',
  'ANALYST_REVIEW',
  'data/sample_occupations.jsonl',
  'Local project seed',
  '2026-06-25T00:00:00Z',
  5
)
ON CONFLICT DO NOTHING;

INSERT INTO locations (city, district, state, region, tier, is_metro)
VALUES
  ('Bengaluru', 'Bengaluru Urban', 'Karnataka', 'South', 'TIER_1', true),
  ('Hyderabad', 'Hyderabad', 'Telangana', 'South', 'TIER_1', true),
  ('Pune', 'Pune', 'Maharashtra', 'West', 'TIER_1', true),
  ('Delhi NCR', NULL, 'Delhi', 'North', 'TIER_1', true),
  ('Mumbai', 'Mumbai', 'Maharashtra', 'West', 'TIER_1', true),
  ('Chennai', 'Chennai', 'Tamil Nadu', 'South', 'TIER_1', true),
  ('Kolkata', 'Kolkata', 'West Bengal', 'East', 'TIER_1', true),
  ('Jaipur', 'Jaipur', 'Rajasthan', 'North', 'TIER_2', false),
  ('Indore', 'Indore', 'Madhya Pradesh', 'Central', 'TIER_2', false),
  ('Coimbatore', 'Coimbatore', 'Tamil Nadu', 'South', 'TIER_2', false),
  ('Kochi', 'Ernakulam', 'Kerala', 'South', 'TIER_2', false),
  ('Lucknow', 'Lucknow', 'Uttar Pradesh', 'North', 'TIER_2', false),
  ('Rajkot', 'Rajkot', 'Gujarat', 'West', 'TIER_2', false)
ON CONFLICT (city, district, state) DO NOTHING;

