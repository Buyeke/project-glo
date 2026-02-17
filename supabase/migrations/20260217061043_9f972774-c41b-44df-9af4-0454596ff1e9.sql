
-- Seed site_content rows for Partners page, Donation tiers, and Job pricing

-- Partners Hero
INSERT INTO public.site_content (content_key, content_value, content_type, section, description, published)
VALUES
  ('partners_hero_title', '{"text": "For Partners & Collaborators"}'::jsonb, 'text', 'partnerships', 'Partners page hero title', true),
  ('partners_hero_subtitle', '{"text": "Join the GLO coordination network operated by Glomera Operations Ltd. Partner with us to reach women across Kenya through secure, dignified referrals."}'::jsonb, 'text', 'partnerships', 'Partners page hero subtitle', true),

-- Partnership type cards
  ('partners_ngo_card', '{"title": "NGO & Service Providers", "description": "Join the GLO coordination network. Get platform access to manage referrals, track cases, and measure impact. Platform subscriptions from $299/month (Community tier) to $899/month (Professional tier).", "links": [{"label": "View Full Pricing", "href": "/contact"}, {"label": "Start Free Trial", "href": "/contact"}]}'::jsonb, 'pricing_card', 'partnerships', 'NGO partnership card', true),
  ('partners_corporate_card', '{"title": "Corporate Sponsors & CSR Programs", "description": "Fund platform access for partner NGOs or sponsor feature development. Sponsorships from $5,000.", "links": [{"label": "Explore CSR Partnerships", "href": "/contact"}]}'::jsonb, 'pricing_card', 'partnerships', 'Corporate partnership card', true),
  ('partners_academic_card', '{"title": "Research & Academic", "description": "Collaborate on research exploring AI, social justice, and community empowerment. From $300 per deliverable.", "links": []}'::jsonb, 'pricing_card', 'partnerships', 'Academic partnership card', true),

-- Current partners list
  ('partners_current_partners', '{"items": [{"name": "OBREAL", "location": "Spain", "description": "International research collaboration"}, {"name": "OBREAL & AAU Youth Incubator", "location": "2024/2025 Cohort", "description": "Innovation incubator program"}]}'::jsonb, 'list', 'partnerships', 'Current partners list', true),

-- Benefits list
  ('partners_benefits', '{"items": ["Direct impact on vulnerable communities", "Transparent reporting and metrics", "Collaboration with AI-for-good initiatives", "Recognition and visibility", "Access to community insights", "Joint research opportunities"]}'::jsonb, 'list', 'partnerships', 'Why Partner With Us benefits', true),

-- Contact email
  ('partners_contact_email', '{"text": "founder@projectglo.org"}'::jsonb, 'text', 'partnerships', 'Partners page contact email', true),

-- Donation tiers
  ('donation_tier_1', '{"title": "Dignity Kits", "description": "Essential hygiene and personal care items", "amount": "$25", "ksh": "KSh 3,250", "numericAmount": 25, "numericKsh": 3250}'::jsonb, 'donation_tier', 'pricing', 'Donation tier 1', true),
  ('donation_tier_2', '{"title": "Mental Health Support", "description": "One week of counseling and therapy sessions", "amount": "$60", "ksh": "KSh 7,800", "numericAmount": 60, "numericKsh": 7800}'::jsonb, 'donation_tier', 'pricing', 'Donation tier 2', true),
  ('donation_tier_3', '{"title": "Temporary Housing", "description": "Safe shelter for a woman for one week", "amount": "$100", "ksh": "KSh 13,000", "numericAmount": 100, "numericKsh": 13000}'::jsonb, 'donation_tier', 'pricing', 'Donation tier 3', true),
  ('donation_tier_4', '{"title": "Family Nutrition", "description": "Nutritious meals for a family of 4 for a month", "amount": "$250", "ksh": "KSh 32,500", "numericAmount": 250, "numericKsh": 32500}'::jsonb, 'donation_tier', 'pricing', 'Donation tier 4', true),

-- Employer job pricing
  ('employer_job_price', '{"text": "$30"}'::jsonb, 'text', 'pricing', 'Job listing price amount', true),
  ('employer_job_duration', '{"text": "30 days"}'::jsonb, 'text', 'pricing', 'Job listing duration', true);
