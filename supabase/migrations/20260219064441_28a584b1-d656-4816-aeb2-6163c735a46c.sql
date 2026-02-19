
-- Insert CMS records for partner registration tier pricing (editable from admin dashboard)
INSERT INTO site_content (content_key, content_value, content_type, section, description, published)
VALUES
  ('partner_tier_pilot', '{"name": "Pilot", "price": "$2,000/month", "amount": 2000, "features": ["Sandbox API access", "Up to 40 users", "Basic analytics", "Email support"]}', 'pricing_card', 'pricing', 'Pilot tier for partner registration', true),
  ('partner_tier_essentials', '{"name": "Essentials", "price": "$2,500/month", "amount": 2500, "features": ["Sandbox API access", "Up to 40 users", "Basic analytics", "Email support"]}', 'pricing_card', 'pricing', 'Essentials tier for partner registration', true),
  ('partner_tier_standard', '{"name": "Standard", "price": "$4,000/month", "amount": 4000, "features": ["Full API access", "Up to 100 users", "Advanced analytics", "Assignment management", "Priority support"]}', 'pricing_card', 'pricing', 'Standard tier for partner registration', true),
  ('partner_tier_premium', '{"name": "Premium", "price": "$10,000/month", "amount": 10000, "features": ["Full API + custom datasets", "Unlimited users", "Faculty dashboard", "Custom integrations", "Dedicated support"]}', 'pricing_card', 'pricing', 'Premium tier for partner registration', true)
ON CONFLICT (content_key) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  section = EXCLUDED.section,
  description = EXCLUDED.description;
