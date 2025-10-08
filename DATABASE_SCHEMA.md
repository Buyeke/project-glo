# Project GLO - Database Schema Documentation

## Overview

Project GLO uses PostgreSQL via Supabase with comprehensive Row-Level Security (RLS) policies for data protection.

## Core Tables

### 1. User Management

#### `profiles`
User profile information and settings.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  age INTEGER,
  location TEXT,
  phone TEXT,
  user_type TEXT NOT NULL DEFAULT 'individual',
  profile_photo_url TEXT,
  id_type TEXT,
  id_number TEXT,
  support_stage TEXT DEFAULT 'initial',
  visit_count INTEGER DEFAULT 0,
  progress_notes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can view/update their own profile
- Admins can view/update all profiles

#### `team_members`
Staff roles and permissions.

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  department TEXT,
  permissions JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles:**
- `admin` - Full system access
- `caseworker` - Case management
- `moderator` - Content moderation

### 2. Service Delivery

#### `services`
Available services catalog.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  availability TEXT DEFAULT 'Available',
  priority_level TEXT DEFAULT 'Medium',
  language_support TEXT DEFAULT 'English',
  contact_phone TEXT,
  contact_url TEXT,
  location TEXT DEFAULT 'Nairobi',
  delivery_mode TEXT DEFAULT 'In-Person',
  key_features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Categories:**
- Healthcare
- Legal Aid
- Counseling
- Housing
- Emergency

#### `service_requests_tracking`
Service request management.

```sql
CREATE TABLE service_requests_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  priority TEXT DEFAULT 'medium',
  language_used TEXT DEFAULT 'english',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  response_time_hours NUMERIC,
  completion_time_hours NUMERIC,
  referral_made BOOLEAN DEFAULT false,
  referral_successful BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Values:**
- `submitted` - Initial request
- `responded` - Team replied
- `in_progress` - Being handled
- `completed` - Resolved

#### `service_bookings`
Appointment scheduling.

```sql
CREATE TABLE service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  service_title TEXT NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  google_calendar_event_id TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. AI Chatbot System

#### `chatbot_intents`
Intent patterns for conversation matching.

```sql
CREATE TABLE chatbot_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  intent_key TEXT NOT NULL,
  keywords JSONB NOT NULL,
  response_template JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Intent:**
```json
{
  "category": "emergency",
  "intent_key": "safety_concern",
  "keywords": ["danger", "unsafe", "threat"],
  "response_template": {
    "en": "I understand you're in danger. Let me connect you with emergency services.",
    "sw": "Naelewa uko hatarini. Wacha nikusaidie kupata msaada wa dharura."
  }
}
```

#### `chat_interactions`
Conversation history logging.

```sql
CREATE TABLE chat_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  original_message TEXT NOT NULL,
  detected_language TEXT,
  translated_message TEXT,
  matched_intent TEXT,
  response TEXT NOT NULL,
  translated_response TEXT,
  matched_service TEXT,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `knowledge_base`
Support content for AI responses.

```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Assessment & Matching

#### `user_assessments`
Needs assessment data.

```sql
CREATE TABLE user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  assessment_number INTEGER NOT NULL,
  need_types TEXT[] NOT NULL,
  urgency_level TEXT NOT NULL,
  language_preference TEXT NOT NULL,
  assessment_responses JSONB NOT NULL,
  location_data JSONB,
  vulnerability_tags TEXT[],
  is_emergency BOOLEAN DEFAULT false,
  literacy_mode TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `match_logs`
Service provider matching records.

```sql
CREATE TABLE match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  assessment_id UUID NOT NULL REFERENCES user_assessments(id),
  match_type TEXT NOT NULL,
  match_score NUMERIC NOT NULL,
  match_criteria JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  provider_response TEXT,
  user_feedback JSONB,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### 5. Case Management

#### `user_concerns`
Individual concerns tracking.

```sql
CREATE TABLE user_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  concern_type TEXT NOT NULL,
  description TEXT,
  assigned_caseworker UUID REFERENCES profiles(id),
  resolved BOOLEAN DEFAULT false,
  date_logged TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `progress_notes`
Caseworker notes.

```sql
CREATE TABLE progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  caseworker_id UUID REFERENCES profiles(id),
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'team',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `allocated_resources`
Resource distribution tracking.

```sql
CREATE TABLE allocated_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  resource_id UUID REFERENCES resources(id),
  allocated_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'allocated',
  notes TEXT,
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Security & Monitoring

#### `security_logs`
Security event tracking.

```sql
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  ip_address TEXT,
  user_agent TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Event Types:**
- `login_attempt`
- `login_success`
- `login_failed`
- `privilege_escalation_attempt`
- `suspicious_activity`
- `admin_access`

#### `rate_limits`
API rate limiting.

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Content Management

#### `blog_posts`
Blog content.

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  thumbnail_url TEXT,
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  seo_title TEXT,
  meta_description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `site_content`
CMS for page content.

```sql
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(section, content_key)
);
```

### 8. Payments & Donations

#### `donations`
Donation records.

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'paypal',
  payment_id TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Statuses:**
- `pending` - Payment initiated
- `completed` - Payment confirmed
- `failed` - Payment rejected
- `refunded` - Payment returned

## Database Functions

### Security Functions

```sql
-- Check if user is admin
CREATE FUNCTION is_admin_user() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND verified = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access data
CREATE FUNCTION can_access_user_data(target_user_id UUID) RETURNS BOOLEAN AS $$
  SELECT auth.uid() = target_user_id OR is_admin_user();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Validation Functions

```sql
-- Validate contact submission
CREATE FUNCTION validate_contact_submission(
  p_name TEXT, 
  p_email TEXT, 
  p_message TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Length checks
  IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
    RETURN false;
  END IF;
  
  -- Email validation
  IF NOT p_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN false;
  END IF;
  
  -- Message checks
  IF LENGTH(TRIM(p_message)) < 10 OR LENGTH(TRIM(p_message)) > 5000 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Indexes

Performance optimization indexes:

```sql
-- User lookups
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Service queries
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_availability ON services(availability);

-- Chat queries
CREATE INDEX idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX idx_chatbot_intents_category ON chatbot_intents(category);

-- Security
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at);
```

## Row-Level Security (RLS)

All tables have RLS enabled. Key patterns:

1. **User Data Access:**
   ```sql
   (user_id = auth.uid()) OR is_admin_user()
   ```

2. **Team Member Access:**
   ```sql
   EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
   ```

3. **Public Content:**
   ```sql
   published = true
   ```

## Backup Strategy

1. **Automated Backups** - Daily via Supabase
2. **Point-in-Time Recovery** - Last 7 days
3. **Export Scripts** - Weekly data exports
4. **Retention** - 90 days for logs, indefinite for user data

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Total Tables:** 30+  
**Security Level:** High (RLS on all tables)
