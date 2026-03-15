# Project GLO — API Reference

**Version:** 2.0.0  
**Last Updated:** 2026-03-15  
**Base URL:** `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [NGO Platform API](#5-ngo-platform-api)
   - [Organization Registration](#51-organization-registration)
   - [API Key Management](#52-api-key-management)
   - [Knowledge Base](#53-knowledge-base)
   - [Case Management](#54-case-management)
   - [Intake Forms & Submissions](#55-intake-forms--submissions)
   - [Reports](#56-reports)
   - [Widget Chat](#57-widget-chat)
6. [Education API](#6-education-api)
   - [Students](#61-students)
   - [Assignments](#62-assignments)
   - [Projects](#63-projects)
   - [Ethics Certification](#64-ethics-certification)
   - [Sandbox](#65-sandbox)
   - [Analytics](#66-analytics)
   - [Faculty Management](#67-faculty-management)
   - [Rate Limits (Education)](#68-rate-limits-education)
   - [Documentation](#69-documentation)
   - [Anonymization](#610-anonymization)
   - [Citations](#611-citations)
7. [Moodle LTI 1.3 Integration](#7-moodle-lti-13-integration)
8. [Embeddable Chat Widget](#8-embeddable-chat-widget)
9. [Webhooks & Notifications](#9-webhooks--notifications)

---

## 1. Overview

Project GLO exposes two primary API surfaces:

| API | Purpose | Auth Method |
|---|---|---|
| **NGO Platform API** | Multi-tenant SaaS for organizations: knowledge bases, case management, intake forms, reports, embeddable chat | API Key (`x-api-key`) or JWT |
| **Education API** | Academic tier for universities: student management, assignments, projects, grading, sandbox data | Education API Key (HMAC-SHA256) or JWT |

Both APIs are deployed as Supabase Edge Functions (Deno runtime) and return JSON responses.

### Base URL

```
https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1
```

### Common Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `x-api-key` | Conditional | Organization API key (NGO API) |
| `Authorization` | Conditional | `Bearer <jwt_token>` (JWT auth) |

---

## 2. Authentication

### 2.1 API Key Authentication (NGO Platform)

API keys are generated during organization registration and are SHA-256 hashed before storage. Keys follow the format `glo_<32hex>`.

```bash
curl -X POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-knowledge-base \
  -H "Content-Type: application/json" \
  -H "x-api-key: glo_your_api_key_here" \
  -d '{"title": "FAQ", "content": "..."}'
```

**Scopes:** Each API key has assigned scopes controlling access:

| Scope | Grants Access To |
|---|---|
| `knowledge_base:read` | GET on knowledge base entries |
| `knowledge_base:write` | POST, PUT, DELETE on knowledge base |
| `widget:embed` | Chat widget endpoint |
| `cases:read` | GET on cases and case notes |
| `cases:write` | POST, PUT on cases and case notes |
| `reports:read` | GET on reports and analytics |

### 2.2 JWT Authentication (Browser / Portal)

For logged-in users accessing via the web portal, pass the Supabase JWT:

```bash
curl -X GET "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-cases?org_id=<uuid>" \
  -H "Authorization: Bearer <supabase_jwt>"
```

The JWT must belong to a user who is a member of the organization (`organization_members` table).

### 2.3 Education API Authentication

Education API endpoints use a shared auth module (`_shared/edu-auth.ts`) supporting:

- **Student API Key:** Issued after ethics certification; hashed with SHA-256
- **JWT:** Faculty and admin access via Supabase auth
- **Scopes:** `education:read`, `education:write`

---

## 3. Error Handling

All errors return a consistent JSON structure:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request — invalid parameters |
| `401` | Unauthorized — missing or invalid auth |
| `403` | Forbidden — insufficient scopes/permissions |
| `404` | Not Found |
| `405` | Method Not Allowed |
| `409` | Conflict — duplicate resource |
| `429` | Too Many Requests — rate limited |
| `500` | Internal Server Error |

### Education API Error Codes

| Code | Description |
|---|---|
| `UNAUTHORIZED` | Missing or invalid credentials |
| `FORBIDDEN` | Insufficient role or scope |
| `VALIDATION_ERROR` | Invalid input data |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Server error |

---

## 4. Rate Limiting

### NGO Platform API

Rate limits are configured per API key in the `organization_api_keys.rate_limit_per_minute` column. Default: **60 requests/minute**.

### Education API

| Context | Requests/Day | Notes |
|---|---|---|
| Normal student usage | 100 | Default for enrolled students |
| Active assignment | 500 | Auto-elevated when assignment is active |
| Off-semester | 0 | API access disabled between semesters |
| Faculty override | Custom | Per-student override via portal |

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1711036800
```

---

## 5. NGO Platform API

### 5.1 Organization Registration

Register a new organization and receive an API key.

```
POST /org-register
```

**Auth:** JWT (Bearer token)

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Organization display name |
| `slug` | string | ✅ | URL-safe identifier (`^[a-z0-9-]+$`) |
| `contact_email` | string | ✅ | Primary contact email |
| `contact_phone` | string | ❌ | Phone number |
| `website` | string | ❌ | Organization website |
| `description` | string | ❌ | Brief description |

**Example Request:**

```bash
curl -X POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-register \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nairobi Women Shelter",
    "slug": "nairobi-women-shelter",
    "contact_email": "admin@nws.or.ke"
  }'
```

**Response (201):**

```json
{
  "organization": {
    "id": "uuid",
    "name": "Nairobi Women Shelter",
    "slug": "nairobi-women-shelter",
    "contact_email": "admin@nws.or.ke",
    "owner_user_id": "uuid",
    "created_at": "2026-03-15T10:00:00Z"
  },
  "api_key": "glo_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "message": "Organization created. Save your API key — it will not be shown again."
}
```

> ⚠️ **The `api_key` is shown only once.** Store it securely.

---

### 5.2 API Key Management

Manage API keys for your organization.

```
GET    /org-api-keys              — List all keys
POST   /org-api-keys              — Create a new key
DELETE /org-api-keys?key_id=<id>  — Revoke a key
```

**Auth:** JWT (Bearer token) — must be an organization member.

**Create Key — Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Display name for the key |
| `scopes` | string[] | ❌ | Permission scopes (defaults to all) |

**Response (201):**

```json
{
  "api_key": "glo_...",
  "key_id": "uuid",
  "message": "Save your API key — it will not be shown again."
}
```

---

### 5.3 Knowledge Base

CRUD operations on organization knowledge base entries. The widget chatbot uses these entries to answer questions.

```
GET    /org-knowledge-base                    — List entries
POST   /org-knowledge-base                    — Create entry
PUT    /org-knowledge-base?id=<entry_id>      — Update entry
DELETE /org-knowledge-base?id=<entry_id>      — Soft-delete entry
```

**Auth:** API Key (`x-api-key`) with `knowledge_base:read`/`knowledge_base:write` scopes, or JWT.

#### List Entries (GET)

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | — | Filter by category |
| `language` | string | — | Filter by language (`en`, `sw`, `sheng`) |
| `search` | string | — | Full-text search on title and content |
| `limit` | int | 50 | Max entries to return |
| `offset` | int | 0 | Pagination offset |

**Response (200):**

```json
{
  "entries": [
    {
      "id": "uuid",
      "title": "What is GBV?",
      "content": "Gender-based violence (GBV) is...",
      "category": "awareness",
      "tags": ["gbv", "education"],
      "language": "en",
      "metadata": {},
      "is_active": true,
      "created_at": "2026-03-01T12:00:00Z",
      "updated_at": "2026-03-10T08:30:00Z"
    }
  ],
  "total": 42
}
```

#### Create Entry (POST)

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Entry title |
| `content` | string | ✅ | Full content (markdown supported) |
| `category` | string | ❌ | Category (default: `general`) |
| `tags` | string[] | ❌ | Tags for filtering |
| `language` | string | ❌ | Language code (default: `en`) |
| `metadata` | object | ❌ | Arbitrary metadata |

**Response (201):**

```json
{
  "entry": { "id": "uuid", "title": "...", "..." }
}
```

#### Update Entry (PUT)

Pass only the fields you want to change:

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "is_active": false
}
```

#### Delete Entry (DELETE)

Soft-deletes (sets `is_active = false`). Returns:

```json
{ "message": "Entry deleted" }
```

---

### 5.4 Case Management

Track client cases with notes and status tracking.

```
GET    /org-cases                              — List cases
GET    /org-cases?case_id=<id>                 — Get case detail
POST   /org-cases                              — Create case
PUT    /org-cases?case_id=<id>                 — Update case
GET    /org-cases?case_id=<id>&action=notes    — List case notes
POST   /org-cases?case_id=<id>&action=notes    — Add case note
```

**Auth:** API Key with `cases:read`/`cases:write` scopes, or JWT.

#### List Cases (GET)

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter: `open`, `in_progress`, `closed`, `on_hold` |
| `priority` | string | Filter: `low`, `medium`, `high`, `critical` |
| `category` | string | Filter by category |
| `assigned_to` | string | Filter by assignee user ID |
| `search` | string | Search in case number, client name |
| `limit` | int | Max results (default: 50) |
| `offset` | int | Pagination offset |

**Response (200):**

```json
{
  "cases": [
    {
      "id": "uuid",
      "case_number": "NWS-2026-0042",
      "client_name": "Jane D.",
      "category": "legal_aid",
      "status": "open",
      "priority": "high",
      "assigned_to": "uuid",
      "description": "Client requires legal representation...",
      "tags": ["urgent", "legal"],
      "opened_at": "2026-03-15T09:00:00Z",
      "created_at": "2026-03-15T09:00:00Z"
    }
  ],
  "total": 128
}
```

#### Create Case (POST)

| Field | Type | Required | Description |
|---|---|---|---|
| `case_number` | string | ✅ | Unique case reference |
| `client_name` | string | ❌ | Client display name |
| `client_identifier` | string | ❌ | Anonymous client ID |
| `category` | string | ❌ | Case category (default: `general`) |
| `priority` | string | ❌ | `low`, `medium`, `high`, `critical` (default: `medium`) |
| `description` | string | ❌ | Case description |
| `tags` | string[] | ❌ | Categorization tags |
| `metadata` | object | ❌ | Custom metadata |

#### Add Case Note (POST with `action=notes`)

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | ✅ | Note content |
| `note_type` | string | ❌ | Type: `general`, `progress`, `assessment` (default: `general`) |

---

### 5.5 Intake Forms & Submissions

Dynamic intake forms with JSON Schema support.

```
GET    /org-intake                             — List forms
GET    /org-intake?form_id=<id>                — Get form detail
POST   /org-intake                             — Create form
PUT    /org-intake?form_id=<id>                — Update form
POST   /org-intake?action=submit               — Submit response (public)
GET    /org-intake?action=submissions           — List submissions
GET    /org-intake?action=submission_detail&id=<id> — Submission detail
PUT    /org-intake?action=update_submission&id=<id> — Update submission status
```

**Auth:** API Key or JWT. Public submissions (`action=submit`) require the form's `is_public` flag.

#### Create Form (POST)

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Form title |
| `description` | string | ❌ | Form description |
| `form_schema` | object | ✅ | JSON Schema defining form fields |
| `is_public` | boolean | ❌ | Allow anonymous submissions (default: `false`) |
| `settings` | object | ❌ | Form settings (notifications, etc.) |

**Example `form_schema`:**

```json
{
  "fields": [
    {
      "name": "full_name",
      "label": "Full Name",
      "type": "text",
      "required": true
    },
    {
      "name": "concern_type",
      "label": "Type of Concern",
      "type": "select",
      "options": ["legal", "medical", "shelter", "counseling"],
      "required": true
    },
    {
      "name": "description",
      "label": "Describe your situation",
      "type": "textarea",
      "required": false
    }
  ]
}
```

#### Submit Response (POST with `action=submit`)

| Field | Type | Required | Description |
|---|---|---|---|
| `form_id` | string | ✅ | Form UUID |
| `responses` | object | ✅ | Key-value pairs matching form schema |
| `submitter_name` | string | ❌ | Submitter display name |
| `submitter_contact` | string | ❌ | Contact info |
| `source` | string | ❌ | `web`, `widget`, `api` |

---

### 5.6 Reports

Aggregated metrics and analytics for your organization.

```
GET /org-reports
```

**Auth:** API Key with `reports:read` scope, or JWT.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `report_type` | string | `summary`, `cases`, `intake`, `knowledge_base`, `activity` |
| `start_date` | string | ISO date (default: 30 days ago) |
| `end_date` | string | ISO date (default: now) |

**Response (200):**

```json
{
  "report": {
    "type": "summary",
    "period": { "start": "2026-02-15", "end": "2026-03-15" },
    "metrics": {
      "total_cases": 128,
      "open_cases": 42,
      "resolved_cases": 86,
      "avg_resolution_hours": 72.5,
      "intake_submissions": 56,
      "knowledge_base_entries": 120,
      "widget_chat_sessions": 340
    }
  }
}
```

---

### 5.7 Widget Chat

Public endpoint for the embeddable chat widget. Organizations embed a JavaScript widget on their website that sends messages to this endpoint.

```
POST /org-widget-chat
```

**Auth:** API Key (`x-api-key`) with `widget:embed` scope.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | ✅ | User message (max 2000 chars) |
| `session_token` | string | ❌ | Existing session token (for conversation continuity) |
| `visitor_id` | string | ❌ | Anonymous visitor identifier |
| `language` | string | ❌ | Preferred language (`en`, `sw`, `sheng`) |

**Response (200):**

```json
{
  "response": "Gender-based violence includes physical, sexual, and emotional abuse...",
  "session_token": "uuid-session-token"
}
```

**How it works:**
1. Validates the API key and `widget:embed` scope
2. Retrieves the organization's knowledge base entries matching the requested language
3. Sends the message + knowledge context to the AI gateway (Gemini 3 Flash)
4. Falls back to keyword matching if AI is unavailable
5. Stores the conversation in `widget_chat_sessions`

---

## 6. Education API

The Education API is a specialized academic tier for university partnerships. All endpoints are prefixed with `education-*`.

### Common Auth

All education endpoints use `_shared/edu-auth.ts` which supports:
- **Student API Key** (issued after ethics certification)
- **Faculty JWT** (Supabase auth with org membership)
- **Scopes:** `education:read`, `education:write`

### Common Response Format

Paginated lists return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 6.1 Students

Faculty-only endpoints for managing student records.

```
GET  /education-students                              — List students
GET  /education-students?action=export                 — Export CSV
POST /education-students?action=bulk_import            — Bulk import
POST /education-students?action=generate_key&student_id=<id> — Generate API key
```

**Auth:** Faculty JWT with `education:read` scope.

**Query Parameters (List):**

| Param | Type | Description |
|---|---|---|
| `status` | string | `active`, `inactive`, `suspended` |
| `ethics_certified` | boolean | Filter by certification status |
| `semester_id` | string | Filter by semester |
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20) |

**Bulk Import (POST):**

```json
{
  "students": [
    {
      "name": "Amina Odhiambo",
      "email": "amina@university.ac.ke",
      "student_id_external": "STU-2026-001",
      "semester_id": "uuid"
    }
  ]
}
```

---

### 6.2 Assignments

Create and manage academic assignments.

```
GET    /education-assignments                          — List assignments
GET    /education-assignments?action=detail&assignment_id=<id> — Assignment detail
POST   /education-assignments                          — Create assignment (faculty)
PUT    /education-assignments?assignment_id=<id>       — Update assignment (faculty)
DELETE /education-assignments?assignment_id=<id>       — Deactivate (faculty)
```

**Auth:** `education:read` for GET, `education:write` + Faculty role for mutations.

**Create Assignment (POST):**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Assignment title |
| `description` | string | ❌ | Instructions and context |
| `difficulty` | string | ❌ | `beginner`, `intermediate`, `advanced` |
| `deadline` | string | ❌ | ISO timestamp |
| `semester_id` | string | ❌ | Associate with semester |
| `starter_query` | string | ❌ | Pre-loaded API query for students |
| `rate_override_per_day` | int | ❌ | Custom rate limit during assignment |

---

### 6.3 Projects

Student project submissions and faculty grading.

```
GET    /education-projects                              — List projects
GET    /education-projects?action=detail&project_id=<id> — Project detail
POST   /education-projects                               — Submit project (student)
PUT    /education-projects?action=grade&project_id=<id>  — Grade project (faculty)
PUT    /education-projects?action=batch_grade             — Batch grade (up to 50)
```

**Auth:** Students can view/submit their own; faculty can view all + grade.

**Submit Project (POST):**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Project title |
| `description` | string | ❌ | Project description |
| `assignment_id` | string | ❌ | Associated assignment |
| `type` | string | ❌ | `analysis`, `research`, `visualization` |
| `repo_url` | string | ❌ | GitHub/GitLab URL |
| `datasets_used` | string[] | ❌ | Datasets referenced |
| `endpoints_used` | string[] | ❌ | API endpoints used |

**Grade Project (PUT):**

```json
{
  "grade": "A",
  "faculty_comments": "Excellent analysis of trauma patterns...",
  "complexity_score": 85
}
```

**Batch Grade (PUT):**

```json
{
  "grades": [
    { "project_id": "uuid-1", "grade": "A", "faculty_comments": "..." },
    { "project_id": "uuid-2", "grade": "B+", "faculty_comments": "..." }
  ]
}
```

---

### 6.4 Ethics Certification

Students must pass an ethics quiz (≥80%) before receiving API access.

```
GET  /education-ethics                    — Get quiz questions
POST /education-ethics                    — Submit quiz answers
GET  /education-ethics?action=status      — Check certification status
```

**Auth:** Student API key or JWT.

**Submit Answers (POST):**

```json
{
  "answers": {
    "q1": "c",
    "q2": "a",
    "q3": "b"
  }
}
```

**Response (200):**

```json
{
  "passed": true,
  "score": 90,
  "threshold": 80,
  "cert_id": "CERT-2026-xxxx",
  "api_key": "edu_... (only shown on first pass)"
}
```

---

### 6.5 Sandbox

Synthetic data environment for student assignments. Returns realistic but fictional case data in English, Swahili, and Sheng.

```
GET /education-sandbox
```

**Auth:** Student API key with `education:read` scope.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `data_type` | string | `cases`, `clients`, `services`, `outcomes` |
| `language` | string | `en`, `sw`, `sheng` |
| `limit` | int | Records to return |

**Response (200):**

```json
{
  "data": [
    {
      "case_id": "Case-A",
      "client_alias": "Client-7",
      "location_alias": "Location-3",
      "type": "legal_aid",
      "status": "resolved",
      "description": "Client sought legal representation for custody dispute..."
    }
  ],
  "metadata": {
    "is_synthetic": true,
    "anonymization_method": "HMAC-SHA256",
    "refresh_batch_id": "batch-2026-03"
  }
}
```

> 🔒 All PII fields are replaced with stable HMAC-SHA256 aliases. No real data is ever exposed.

---

### 6.6 Analytics

Organization-level API usage analytics (faculty only).

```
GET /education-analytics
```

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `period` | string | `day`, `week`, `month` |
| `student_id` | string | Filter by student |

---

### 6.7 Faculty Management

```
GET  /education-faculty                — List faculty members
POST /education-faculty                — Add faculty member
PUT  /education-faculty                — Update faculty role/permissions
```

**Auth:** Faculty JWT with admin or owner role.

---

### 6.8 Rate Limits (Education)

Check and manage student rate limits.

```
GET /education-rate-limits
```

**Auth:** Student key (own limits) or Faculty JWT (all students).

**Response (200):**

```json
{
  "student_id": "uuid",
  "daily_limit": 100,
  "used_today": 42,
  "remaining": 58,
  "resets_at": "2026-03-16T00:00:00Z",
  "active_assignment_boost": false
}
```

---

### 6.9 Documentation

Self-serve API documentation endpoint.

```
GET /education-docs
```

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `doc_type` | string | `api`, `guide`, `faq` |
| `language` | string | `en`, `sw` |

---

### 6.10 Anonymization

Server-side PII anonymization for case data.

```
POST /education-anonymize
```

**Auth:** Student or Faculty with `education:read` scope.

**Request Body:**

```json
{
  "data": {
    "client_name": "Jane Wanjiku",
    "location": "Kibera, Nairobi"
  },
  "fields": ["client_name", "location"]
}
```

**Response (200):**

```json
{
  "data": {
    "client_name": "Client-7a3f",
    "location": "Location-b2e1"
  },
  "method": "HMAC-SHA256"
}
```

---

### 6.11 Citations

Generate academic citations for datasets used.

```
POST /education-citation
```

**Auth:** Student API key.

**Request Body:**

```json
{
  "datasets": ["sandbox-cases-en", "sandbox-outcomes-sw"],
  "format": "APA"
}
```

**Response (200):**

```json
{
  "citations": [
    "Project GLO. (2026). Synthetic GBV Case Dataset [Data set, English]. Project GLO Education API. https://project-glo.lovable.app"
  ]
}
```

---

## 7. Moodle LTI 1.3 Integration

GLO integrates with Moodle via LTI 1.3 for SSO, auto-enrollment, assignment deep linking, and grade passback.

### LTI Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/lti-login` | POST | OIDC login initiation |
| `/lti-launch` | POST | Resource link launch (signed JWT) |
| `/lti-deeplink` | POST | Content selection for assignment linking |
| `/lti-jwks` | GET | GLO's public RSA keyset |

### Authentication Flow

```
Student clicks activity in Moodle
    │
    ▼
Moodle → POST /lti-login (OIDC initiation)
    │
    ▼
GLO validates issuer, redirects to Moodle auth
    │
    ▼
Moodle authenticates, sends signed JWT → POST /lti-launch
    │
    ▼
GLO validates JWT, auto-provisions student, redirects to portal
```

### Data Mapping

| Moodle Concept | GLO Entity | Table |
|---|---|---|
| Course | Organization | `organizations` |
| Course Section/Term | Semester | `edu_semesters` |
| Student enrollment | Student record | `edu_students` |
| Instructor | Faculty member | `organization_members` |
| Assignment | Assignment | `edu_assignments` |
| Submission | Project | `edu_projects` |
| Grade | Project grade | `edu_projects.grade` |

### Grade Passback

GLO pushes grades to Moodle via LTI Assignment and Grade Services (AGS) 2.0:

```json
{
  "userId": "<moodle-sub-claim>",
  "scoreGiven": 85,
  "scoreMaximum": 100,
  "activityProgress": "Completed",
  "gradingProgress": "FullyGraded",
  "timestamp": "2026-03-15T12:00:00Z"
}
```

### Role Mapping

| Moodle LTI Role | GLO Role |
|---|---|
| `membership#Instructor` | Faculty |
| `membership#Learner` | Student |
| `institution/person#Administrator` | Admin |
| `membership#ContentDeveloper` | Faculty |
| `membership#Mentor` | Faculty |

### Configuration

For full Moodle setup instructions, see:
- [MOODLE_LTI_INTEGRATION.md](./MOODLE_LTI_INTEGRATION.md) — Technical specification
- [MOODLE_ONBOARDING_BRIEF.md](./MOODLE_ONBOARDING_BRIEF.md) — University IT onboarding guide

---

## 8. Embeddable Chat Widget

Organizations can embed a context-aware chatbot on any website using a JavaScript widget.

### Installation

```html
<script
  src="https://project-glo.lovable.app/widget/glo-chat-widget.js"
  data-api-key="glo_your_api_key_here"
  data-org-name="Your Organization"
  data-primary-color="#7c3aed"
  data-language="en"
  defer>
</script>
```

### Configuration Attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-api-key` | ✅ | — | Organization API key with `widget:embed` scope |
| `data-org-name` | ❌ | `"Support"` | Display name in widget header |
| `data-primary-color` | ❌ | `#7c3aed` | Widget accent color |
| `data-language` | ❌ | `en` | Default language (`en`, `sw`, `sheng`) |
| `data-position` | ❌ | `bottom-right` | Widget position on page |

### Widget Behavior

- Sends messages to `POST /org-widget-chat` with the configured API key
- Maintains session continuity via `session_token`
- Responses are generated from the organization's knowledge base using AI (Gemini 3 Flash)
- Falls back to keyword matching if AI is unavailable
- Supports English, Swahili, and Sheng
- Trauma-informed, culturally sensitive response style

---

## 9. Webhooks & Notifications

### Auth Notifications

Login events trigger email notifications via the `auth-notification` edge function. Notifications are sent once per session to prevent duplicates.

### Activity Logging

All mutations on organization resources are logged to `org_activity_log`:

```json
{
  "activity_type": "case_created",
  "entity_type": "case",
  "entity_id": "uuid",
  "organization_id": "uuid",
  "performed_by": "uuid",
  "metadata": { "case_number": "NWS-2026-0042" }
}
```

### Audit Trail

Critical tables have audit triggers recording all INSERT, UPDATE, and DELETE operations in `audit_trail` with before/after data snapshots and changed field tracking.

---

## Appendix A: Complete Endpoint Reference

| Endpoint | Methods | Auth | Description |
|---|---|---|---|
| `/org-register` | POST | JWT | Register organization |
| `/org-api-keys` | GET, POST, DELETE | JWT | Manage API keys |
| `/org-knowledge-base` | GET, POST, PUT, DELETE | API Key / JWT | Knowledge base CRUD |
| `/org-cases` | GET, POST, PUT | API Key / JWT | Case management |
| `/org-intake` | GET, POST, PUT | API Key / JWT | Intake forms & submissions |
| `/org-reports` | GET | API Key / JWT | Analytics & reports |
| `/org-widget-chat` | POST | API Key | Widget chat messages |
| `/education-students` | GET, POST | Faculty JWT | Student management |
| `/education-assignments` | GET, POST, PUT, DELETE | Edu Auth | Assignment management |
| `/education-projects` | GET, POST, PUT | Edu Auth | Project submissions & grading |
| `/education-ethics` | GET, POST | Edu Auth | Ethics certification quiz |
| `/education-sandbox` | GET | Student Key | Synthetic data environment |
| `/education-analytics` | GET | Faculty JWT | Usage analytics |
| `/education-faculty` | GET, POST, PUT | Faculty JWT | Faculty management |
| `/education-rate-limits` | GET | Edu Auth | Rate limit status |
| `/education-docs` | GET | Edu Auth | Self-serve documentation |
| `/education-anonymize` | POST | Edu Auth | PII anonymization |
| `/education-citation` | POST | Student Key | Academic citations |
| `/education-setup` | POST | Faculty JWT | Initial org/semester setup |
| `/lti-login` | POST | LTI 1.3 | OIDC login initiation |
| `/lti-launch` | POST | LTI 1.3 | Resource link launch |
| `/lti-deeplink` | POST | LTI 1.3 | Assignment deep linking |
| `/lti-jwks` | GET | Public | GLO public keyset |
| `/ai-chat-processor` | POST | JWT | Authenticated AI chat |
| `/ai-chat-public` | POST | Public | Public AI chat |
| `/search-knowledge` | POST | Public | Knowledge search |

---

**Document Version:** 2.0.0  
**Last Updated:** 2026-03-15  
**Classification:** Technical — External Distribution OK  
**Contact:** tech@projectglo.org
