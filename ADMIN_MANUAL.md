# Project GLO - Admin Manual & User Guide

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [User Management](#user-management)
3. [Content Management](#content-management)
4. [Service Management](#service-management)
5. [Case Management](#case-management)
6. [Analytics & Reporting](#analytics--reporting)
7. [Security Management](#security-management)
8. [System Configuration](#system-configuration)

---

## Admin Dashboard Overview

### Accessing Admin Panel

1. Navigate to: `https://projectglo.org/admin-login`
2. Login with admin credentials
3. Dashboard shows key metrics:
   - Active users
   - Pending service requests
   - Recent chat interactions
   - Security alerts
   - System health

### Dashboard Sections

```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                             │
├─────────────────────────────────────────────┤
│  [Users] [Services] [Content] [Cases]       │
│  [Security] [Reports] [Settings]             │
└─────────────────────────────────────────────┘
```

---

## User Management

### Managing User Profiles

#### View All Users

1. Navigate to **Admin Dashboard → Users**
2. Search/filter users by:
   - User type (individual, NGO, employer)
   - Registration date
   - Location
   - Support stage

#### Edit User Profile

1. Click on user name
2. Editable fields:
   - Full name
   - Contact information
   - Support stage
   - Assigned caseworker
3. Click **Save Changes**

#### User Types

**Individual Users:**
- Default type for service recipients
- Can access services and support
- Tracked through case management

**NGO Users:**
- Service provider accounts
- Can view assigned cases
- Access provider dashboard

**Team Members:**
- Admin
- Caseworker
- Moderator

### Managing Team Members

#### Add New Team Member

```sql
-- Method 1: Via SQL
SELECT setup_admin_user('email@example.com', 'Full Name');

-- Method 2: Via Admin Panel
1. Users → Team Members → Add New
2. Enter email and role
3. User receives invitation email
4. They sign up and get assigned role
```

#### Roles & Permissions

**Admin:**
- Full system access
- User management
- Content management
- Security configuration
- All reports

**Caseworker:**
- View assigned cases
- Update progress notes
- Allocate resources
- Limited reports

**Moderator:**
- Content moderation
- Chat monitoring
- User feedback review

#### Change User Role

1. Navigate to **Team Members**
2. Click on member name
3. Select new role from dropdown
4. Confirm change

**Warning:** Changing roles affects permissions immediately.

---

## Content Management

### Managing Blog Posts

#### Create New Post

1. **Admin Dashboard → Content → Blog Posts → New Post**
2. Fill in required fields:
   - Title
   - Slug (auto-generated, can edit)
   - Excerpt (150 characters)
   - Content (rich text editor)
   - Category
   - Tags
   - Featured image
3. SEO Settings:
   - Meta title
   - Meta description
4. **Save as Draft** or **Publish**

#### Schedule Post

1. Edit blog post
2. Set **Scheduled Publish Date**
3. Save
4. Post auto-publishes at scheduled time

#### Upload Images

1. Click image upload button in editor
2. Drag and drop or select file
3. Images stored in `blog-images` bucket
4. Automatically optimized

### Managing Site Content

#### Edit Homepage Content

1. **Admin Dashboard → Content → Site Content**
2. Select section (hero, about, services)
3. Edit content in JSON format:

```json
{
  "title": {
    "en": "Welcome to Project GLO",
    "sw": "Karibu Project GLO",
    "sheng": "Niaje Project GLO"
  },
  "description": {
    "en": "Supporting vulnerable populations",
    "sw": "Kusaidia watu mahitaji",
    "sheng": "Tunasaidia watu wenye shida"
  }
}
```

4. Preview changes
5. Publish

#### Add New Section

```javascript
// Admin Panel → Site Content → Add Section
{
  "section": "testimonials",
  "content_key": "testimonial_1",
  "content_type": "object",
  "content_value": {
    "name": "Jane Doe",
    "quote": "Project GLO changed my life",
    "image_url": "/uploads/testimonial-1.jpg"
  }
}
```

---

## Service Management

### Managing Services

#### Add New Service

1. **Admin Dashboard → Services → Add New**
2. Required fields:
   - Title
   - Description
   - Category (Healthcare, Legal, Counseling, etc.)
   - Contact information
   - Location
   - Availability
   - Priority level
   - Language support
3. Click **Create Service**

#### Edit Service

1. Navigate to **Services**
2. Click service name
3. Update information
4. Change availability status:
   - Available
   - Temporarily Unavailable
   - Discontinued

#### Service Categories

- **Healthcare** - Medical services
- **Legal Aid** - Legal support
- **Counseling** - Mental health
- **Housing** - Shelter assistance
- **Education** - Training programs
- **Emergency** - Crisis support

### Service Booking Management

#### View Bookings

1. **Admin Dashboard → Services → Bookings**
2. Filter by:
   - Service type
   - Date range
   - Status
   - User

#### Manage Booking

- **Confirm** - Approve booking
- **Reschedule** - Change date/time
- **Cancel** - Cancel with reason

#### Google Calendar Integration

Bookings automatically sync to Google Calendar:

1. **Settings → Integrations → Google Calendar**
2. Connect Google account
3. Select calendar
4. Enable sync

---

## Case Management

### Managing User Concerns

#### View All Concerns

1. **Admin Dashboard → Cases → Concerns**
2. Filter by:
   - Status (open, in progress, resolved)
   - Concern type
   - Assigned caseworker
   - Priority

#### Assign Caseworker

1. Click concern
2. Select **Assign To**
3. Choose caseworker
4. Caseworker receives notification

#### Add Progress Note

```markdown
1. Open concern/case
2. Click "Add Progress Note"
3. Select note type:
   - General update
   - Follow-up call
   - Resource allocation
   - External referral
4. Enter note content
5. Set visibility (team only / include user)
6. Save
```

### Resource Allocation

#### Allocate Resource to User

1. **Cases → Resource Allocation → New**
2. Select user
3. Select resource type:
   - Financial assistance
   - Food voucher
   - Transportation
   - Medical supplies
4. Enter amount/details
5. Add notes
6. Submit

#### Track Allocated Resources

View all allocations:
- By user
- By resource type
- By date range
- By status (allocated, used, expired)

### Assessment Review

#### View User Assessments

1. **Cases → Assessments**
2. View assessment details:
   - Need types
   - Urgency level
   - Vulnerability tags
   - Responses
3. Review matching results
4. Override automatic matching if needed

---

## Analytics & Reporting

### Dashboard Metrics

**Key Performance Indicators:**
- Total users (growth trend)
- Active service requests
- Response time (average)
- Completion rate
- User satisfaction score

### Generated Reports

#### Weekly Summary Report

Auto-generated every Monday:

```
📊 Weekly Report (Jan 1-7, 2025)

Users:
- New registrations: 45
- Active users: 230
- Returning users: 180

Services:
- Total requests: 67
- Completed: 45
- In progress: 22
- Average response time: 4.2 hours

Popular Services:
1. Crisis Counseling (23)
2. Legal Aid (15)
3. Housing Assistance (12)

Languages:
- English: 45%
- Swahili: 30%
- Sheng: 25%

Chatbot:
- Total interactions: 456
- Average confidence: 0.82
- Emergency detections: 8
```

#### Custom Reports

1. **Reports → Custom Report**
2. Select metrics:
   - Date range
   - User demographics
   - Service usage
   - Response times
   - Languages
3. Apply filters
4. Generate report
5. Export as CSV/PDF

### Usage Statistics

#### Chat Interactions

- Total messages
- Average conversation length
- Intent distribution
- Language breakdown
- Emergency detections

#### Service Metrics

- Request by service type
- Geographic distribution
- Peak usage times
- Completion rates

---

## Security Management

### Security Dashboard

View security events:

1. **Admin Dashboard → Security**
2. Recent events:
   - Login attempts (success/failed)
   - Admin actions
   - Suspicious activity
   - Data access logs

### Manage Security Logs

#### View Logs

```sql
-- Filter by event type
SELECT * FROM security_logs 
WHERE event_type = 'suspicious_activity'
ORDER BY created_at DESC;
```

#### Log Retention

- Default: 90 days
- Change retention:
  ```sql
  SELECT rotate_security_logs(180); -- Keep 180 days
  ```

### Rate Limiting

#### View Rate Limits

1. **Security → Rate Limits**
2. View current limits:
   - Contact form: 5/hour
   - Chat messages: 30/minute
   - API calls: 100/hour

#### Adjust Rate Limits

```sql
-- Update rate limit
UPDATE rate_limits 
SET attempt_count = 10 
WHERE action_type = 'contact_submission';
```

### Security Audit

#### Run Security Audit

```sql
-- Check system security
SELECT * FROM security_audit();
```

Results show:
- RLS status on all tables
- Admin user count
- Security triggers
- Potential vulnerabilities

---

## System Configuration

### Email Settings

#### Configure SMTP

1. **Settings → Email**
2. SMTP settings:
   - Host
   - Port
   - Username
   - Password
3. Test connection
4. Save

#### Email Templates

Edit templates for:
- Welcome email
- Password reset
- Appointment confirmation
- Service request updates

### Payment Configuration

#### PayPal Setup

1. **Settings → Payments → PayPal**
2. Enter credentials:
   - Client ID
   - Client Secret
   - Webhook ID
3. Select mode (Sandbox/Live)
4. Test connection
5. Save

### Chatbot Configuration

#### Update Intents

1. **Settings → Chatbot → Intents**
2. Add/edit intent:

```json
{
  "category": "greeting",
  "intent_key": "welcome",
  "keywords": ["hello", "hi", "hey", "niaje"],
  "response_template": {
    "en": "Hello! How can I help you?",
    "sw": "Habari! Naweza kukusaidia vipi?",
    "sheng": "Niaje! Story yako nini?"
  }
}
```

3. Test intent matching
4. Save

#### AI Settings

1. **Settings → AI Configuration**
2. Model settings:
   - Temperature (0.7)
   - Max tokens (500)
   - System prompt
3. Save

### Backup & Restore

#### Manual Backup

```bash
# Database backup
supabase db dump > backup.sql

# Storage backup
supabase storage download blog-images --all
```

#### Restore from Backup

```bash
# Restore database
psql -U postgres < backup.sql

# Restore storage
supabase storage upload blog-images/* --recursive
```

### System Maintenance

#### Clear Cache

1. **Settings → Maintenance → Clear Cache**
2. Select cache type:
   - Query cache
   - Static assets
   - User sessions
3. Confirm

#### Update System

```bash
# Update dependencies
bun update

# Deploy updates
git pull origin main
bun run build
```

---

## Troubleshooting

### Common Issues

#### Users Can't Login

1. Check Supabase Auth status
2. Verify email confirmation
3. Reset password if needed
4. Check RLS policies

#### Services Not Showing

1. Verify service availability
2. Check RLS policies on services table
3. Clear cache
4. Refresh page

#### Chat Not Responding

1. Check OpenAI API key
2. View edge function logs
3. Test intent matching
4. Verify Supabase connection

### Support Contacts

- **Technical Issues:** tech@projectglo.org
- **Content Issues:** content@projectglo.org
- **Security Issues:** security@projectglo.org
- **General Inquiries:** info@projectglo.org

---

## Best Practices

### Daily Tasks

- [ ] Review pending service requests
- [ ] Check security alerts
- [ ] Monitor chat interactions
- [ ] Respond to user feedback

### Weekly Tasks

- [ ] Review weekly report
- [ ] Update blog content
- [ ] Review team member activity
- [ ] Backup database

### Monthly Tasks

- [ ] Security audit
- [ ] Update chatbot intents
- [ ] Review and update services
- [ ] Team training/meetings

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Next Review:** 2025-04-10  
**Owner:** Project GLO Admin Team
