
INSERT INTO public.site_content (content_key, content_value, content_type, section, description, published)
VALUES (
  'emergency_contacts',
  '{"items": [{"organization": "Kenya Police", "phone": "999 / 112", "locations_served": "Nationwide"}, {"organization": "Childline Kenya", "phone": "116", "locations_served": "Nationwide"}, {"organization": "Healthcare Assistance Kenya (GBV)", "phone": "1195", "locations_served": "Nationwide"}, {"organization": "Gender Violence Recovery Centre (GVRC)", "phone": "0709 319 000", "locations_served": "Nairobi"}, {"organization": "FIDA Kenya (Legal Aid)", "phone": "0722 509 760", "locations_served": "Nationwide"}]}'::jsonb,
  'list',
  'resources',
  'Emergency contacts displayed on Resources page - editable list of organizations with phone numbers and locations served',
  true
);
