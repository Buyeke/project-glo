# Project GLO — API Reference

**Version:** 2.1.0  
**Last Updated:** 2026-03-15  
**Base URL:** `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1`  
**Status Page:** `https://status.projectglo.org` *(planned)*

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Overview](#2-overview)
3. [Authentication](#3-authentication)
4. [Error Handling](#4-error-handling)
5. [Rate Limiting](#5-rate-limiting)
6. [Pagination](#6-pagination)
7. [Versioning](#7-versioning)
8. [Timestamps & Timezones](#8-timestamps--timezones)
9. [CORS Policy](#9-cors-policy)
10. [NGO Platform API](#10-ngo-platform-api)
    - [Organization Registration](#101-organization-registration)
    - [API Key Management](#102-api-key-management)
    - [Knowledge Base](#103-knowledge-base)
    - [Case Management](#104-case-management)
    - [Intake Forms & Submissions](#105-intake-forms--submissions)
    - [Reports & Data Export](#106-reports--data-export)
    - [Widget Chat](#107-widget-chat)
11. [Education API](#11-education-api)
    - [Students](#111-students)
    - [Assignments](#112-assignments)
    - [Projects & File Uploads](#113-projects--file-uploads)
    - [Ethics Certification](#114-ethics-certification)
    - [Sandbox](#115-sandbox)
    - [Analytics](#116-analytics)
    - [Faculty Management](#117-faculty-management)
    - [Rate Limits (Education)](#118-rate-limits-education)
    - [Documentation](#119-documentation)
    - [Anonymization](#1110-anonymization)
    - [Citations](#1111-citations)
    - [Semester Lifecycle](#1112-semester-lifecycle)
12. [Moodle LTI 1.3 Integration](#12-moodle-lti-13-integration)
13. [Embeddable Chat Widget](#13-embeddable-chat-widget)
14. [Webhooks & Notifications](#14-webhooks--notifications)
15. [Testing & Sandbox Environment](#15-testing--sandbox-environment)
16. [Data Retention Policy](#16-data-retention-policy)
17. [SLA & Performance](#17-sla--performance)
18. [Common Use Cases](#18-common-use-cases)
19. [Troubleshooting](#19-troubleshooting)
20. [Code Examples](#20-code-examples)
21. [Changelog](#21-changelog)

---

## 1. Quick Start

### NGO — Add a chatbot to your website in 5 minutes

```bash
# 1. Register your organization (requires a GLO account)
curl -X POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-register \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My NGO", "slug": "my-ngo", "contact_email": "admin@myngo.org"}'

# 2. Save the API key from the response — it won't be shown again!

# 3. Add a knowledge base entry
curl -X POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-knowledge-base \
  -H "x-api-key: glo_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Our Services", "content": "We provide legal aid, counseling, and shelter."}'

# 4. Embed the widget on your website
```

```html
<script
  src="https://project-glo.lovable.app/widget/glo-chat-widget.js"
  data-api-key="glo_YOUR_KEY"
  data-org-name="My NGO"
  defer>
</script>
```

```bash
# 5. Monitor usage
curl https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-reports \
  -H "x-api-key: glo_YOUR_KEY"
```

### University — Moodle integration

1. IT admin registers organization → receives API key
2. Configure Moodle LTI 1.3 external tool (see [Section 12](#12-moodle-lti-13-integration))
3. Faculty creates assignments via Partner Portal or API
4. Students auto-enroll on first Moodle launch → complete ethics quiz → receive student API key
5. Grades sync automatically back to Moodle gradebook

---

## 2. Overview

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

All endpoint paths in this document are relative to this base URL. For example, `/org-register` means:

```
https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-register
```

### Common Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `x-api-key` | Conditional | Organization API key (NGO API) |
| `Authorization` | Conditional | `Bearer <jwt_token>` (JWT auth) |

---

## 3. Authentication

### 3.1 API Key Authentication (NGO Platform)

API keys are generated during organization registration and are SHA-256 hashed before storage. Keys follow the format `glo_<32hex>` (38 characters total).

```bash
curl -X POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-knowledge-base \
  -H "Content-Type: application/json" \
  -H "x-api-key: glo_your_api_key_here" \
  -d '{"title": "FAQ", "content": "..."}'
```

**Key Properties:**

| Property | Value |
|---|---|
| Format | `glo_<32 hex characters>` |
| Hash algorithm | SHA-256 (server-side) |
| Expiration | **Keys do not expire** — revoke manually via API or portal |
| Revocation | Immediate — revoked keys return `401` on next request |
| Storage | Only the hash is stored; the plaintext key is shown once at creation |

**Scopes:** Each API key has assigned scopes controlling access:

| Scope | Grants Access To |
|---|---|
| `knowledge_base:read` | GET on knowledge base entries |
| `knowledge_base:write` | POST, PUT, DELETE on knowledge base |
| `widget:embed` | Chat widget endpoint |
| `cases:read` | GET on cases and case notes |
| `cases:write` | POST, PUT on cases and case notes |
| `reports:read` | GET on reports and analytics |

### 3.2 JWT Authentication (Browser / Portal)

For logged-in users accessing via the web portal, pass the Supabase JWT:

```bash
curl -X GET "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-cases?org_id=<uuid>" \
  -H "Authorization: Bearer <supabase_jwt>"
```

The JWT must belong to a user who is a member of the organization (`organization_members` table).

**JWT Properties:**

| Property | Value |
|---|---|
| Issuer | Supabase Auth |
| Lifetime | **1 hour** (access token) |
| Refresh token | **7 days** — automatically refreshed by the Supabase client SDK |
| Algorithm | HS256 |

The Supabase client SDK handles token refresh automatically. If building a custom integration, call the refresh endpoint before expiry.

### 3.3 Education API Authentication

Education API endpoints use a shared auth module (`_shared/edu-auth.ts`) supporting:

- **Student API Key:** Issued after ethics certification; hashed with SHA-256. Format: `edu_<32hex>`. **Does not expire** but is deactivated when student status changes to `inactive` or `suspended`.
- **JWT:** Faculty and admin access via Supabase auth
- **Scopes:** `education:read`, `education:write`

---

## 4. Error Handling

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

## 5. Rate Limiting

### NGO Platform API

Rate limits are enforced **per API key** (not per IP or per organization). Default: **60 requests/minute**.

| Property | Value |
|---|---|
| Scope | Per API key |
| Default limit | 60 requests/minute |
| Configurable | Yes — via `organization_api_keys.rate_limit_per_minute` |
| Maximum configurable | 300 requests/minute |

**When you hit the limit:**

1. The API returns `429 Too Many Requests`
2. The response includes a `Retry-After` header (seconds until reset)
3. The rate limit window resets on a rolling 60-second basis

**Response headers on every request:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1710504000
Retry-After: 18          (only on 429 responses)
```

**429 Response body:**

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retry_after": 18,
  "reset_at": "2026-03-15T12:00:18Z"
}
```

**Requesting a limit increase:** Contact support@projectglo.org with your organization ID and use case.

### Education API

Rate limits are enforced **per student**, tracked daily (UTC midnight reset):

| Context | Requests/Day | Notes |
|---|---|---|
| Normal student usage | 100 | Default for enrolled students |
| Active assignment | 500 | Auto-elevated when assignment is active |
| Off-semester | 0 | API access disabled between semesters |
| Faculty override | Custom | Per-student override via portal |

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710547200
```

### Internal Rate Limits (Platform)

The platform also enforces rate limits on internal actions via the `rate-limit-check` edge function:

| Action | Max Attempts | Window | Block Duration |
|---|---|---|---|
| `contact_submission` | 3 | 60 min | 120 min |
| `login_attempt` | 5 | 15 min | 30 min |
| `ai_chat` | 20 | 60 min | 15 min |

These are enforced per identifier (user ID or IP address). On error, the system **denies by default** (fail-closed).

---

## 6. Pagination

All list endpoints support pagination. Two patterns are used:

### Offset-based (NGO Platform API)

Used by: Knowledge Base, Cases, Intake submissions

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | int | 50 | 200 | Max items to return |
| `offset` | int | 0 | — | Number of items to skip |

Response includes a `total` field:

```json
{
  "cases": [...],
  "total": 128
}
```

**Example:** Fetch page 3 of cases (50 per page):
```
GET /org-cases?limit=50&offset=100
```

### Page-based (Education API)

Used by: Students, Projects, Assignments, Analytics

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | int | 1 | — | Page number |
| `limit` | int | 20 | 100 | Items per page |

Response includes pagination metadata:

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

### Default Page Sizes

| Endpoint | Default | Max |
|---|---|---|
| Knowledge Base | 50 | 200 |
| Cases | 50 | 200 |
| Intake Submissions | 50 | 200 |
| Students | 20 | 100 |
| Assignments | 20 | 100 |
| Projects | 20 | 100 |
| Sandbox Data | 50 | 500 |
| Activity Log | 50 | 200 |

---

## 7. Versioning

### Current Version

The API is currently at **v2.1.0**. There is no version prefix in the URL (`/v1/`, `/v2/`). The API is versioned by the document version and the changelog below.

### Versioning Strategy

| Category | Policy |
|---|---|
| Additive changes | New fields, endpoints, or optional parameters are added without version bumps. Existing clients are unaffected. |
| Breaking changes | Announced **90 days in advance** via email to all registered organization contacts. Breaking changes increment the major version. |
| Deprecation | Deprecated endpoints return a `X-Deprecated: true` header and a `sunset` date in the response body for 90 days before removal. |
| Migration guides | Published in the changelog (Section 21) with before/after examples. |

**Current URL structure:**

```
https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/<function-name>
```

> Note: The `/v1/` in the URL is Supabase's edge function routing, **not** the API version. All API versions are served through the same URL path.

### Planned: URL Versioning

Future releases may introduce explicit API versioning via a request header:

```
X-API-Version: 2
```

This will be announced with a 90-day migration window.

---

## 8. Timestamps & Timezones

| Property | Value |
|---|---|
| Format | ISO 8601 (`2026-03-15T12:00:00Z`) |
| Timezone | **UTC** — all timestamps are stored and returned in UTC |
| Database timezone | PostgreSQL `timestamptz` (timezone-aware, stored as UTC) |
| Client responsibility | Convert to local timezone for display |

**Date range queries:**

When filtering by date ranges (e.g., `start_date`, `end_date`), pass dates in ISO 8601 format. Dates without a time component are interpreted as midnight UTC:

```
# These are equivalent:
start_date=2026-03-01
start_date=2026-03-01T00:00:00Z
```

**Cross-timezone considerations:**

If your organization operates across timezones, be aware that a query for "March 15" in UTC may not align with "March 15" in EAT (UTC+3). Adjust your date range accordingly:

```
# To query "March 15 EAT" (Kenya), use:
start_date=2026-03-14T21:00:00Z
end_date=2026-03-15T21:00:00Z
```

---

## 9. CORS Policy

### Allowed Origins

The API restricts cross-origin requests to the following domains:

| Origin | Purpose |
|---|---|
| `https://project-glo.lovable.app` | Production app |
| `https://projectglo.org` | Custom domain |
| `https://www.projectglo.org` | Custom domain (www) |
| `https://lovable.dev` | Lovable platform |
| `https://*.sandbox.lovable.dev` | Preview environments |
| `http://localhost:3000` | Local development |

### Can I call the API from browser JavaScript?

**Yes, with restrictions:**

- **Widget endpoint** (`/org-widget-chat`): Accepts requests from **any origin** (`Access-Control-Allow-Origin: *`). This is required for the embeddable widget to work on third-party websites.
- **All other endpoints**: Restricted to the allowed origins above. If you need to call these from your own domain, you must route through a backend proxy.

**CORS headers returned:**

```
Access-Control-Allow-Origin: <requesting-origin or *>
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
```

### Backend-only API calls

If you're integrating server-to-server (e.g., your backend calling GLO's API), CORS does not apply. Use the API key directly from your server.

---

## 10. NGO Platform API

### 10.1 Organization Registration

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

### 10.2 API Key Management

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

### 10.3 Knowledge Base

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
| `limit` | int | 50 | Max entries to return (max: 200) |
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

### 10.4 Case Management

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

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `status` | string | — | — | Filter: `open`, `in_progress`, `closed`, `on_hold` |
| `priority` | string | — | — | Filter: `low`, `medium`, `high`, `critical` |
| `category` | string | — | — | Filter by category |
| `assigned_to` | string | — | — | Filter by assignee user ID |
| `search` | string | — | — | Search (see below) |
| `limit` | int | 50 | 200 | Max results |
| `offset` | int | 0 | — | Pagination offset |

**Search behavior (`search` parameter):**

The `search` parameter performs a case-insensitive substring match across the following fields:

- `case_number` — e.g., "NWS-2026"
- `client_name` — e.g., "Jane"
- `description` — e.g., "custody dispute"
- `tags` — e.g., "urgent"

Results are ranked by relevance (case number exact matches first, then client name, then description).

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

### 10.5 Intake Forms & Submissions

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

### 10.6 Reports & Data Export

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

#### Data Export

Organizations can export their data in bulk:

| What | How | Format |
|---|---|---|
| Knowledge base entries | `GET /org-knowledge-base?limit=200` (paginate) | JSON |
| Cases | `GET /org-cases?limit=200` (paginate) | JSON |
| Intake submissions | `GET /org-intake?action=submissions&limit=200` | JSON |
| Activity log | `GET /org-reports?report_type=activity` | JSON |
| Contact submissions | Admin dashboard → Export button | CSV |
| Chat interactions | Admin dashboard → Export button | CSV |

> **CSV export** for contact submissions and chat interactions is handled by dedicated edge functions (`contact-data-export`, `audit-trail-export`) invoked from the admin dashboard. These are not directly callable via API key.

**Planned:** A dedicated `/org-export` endpoint for bulk JSON/CSV export with email delivery for large datasets.

---

### 10.7 Widget Chat

Public endpoint for the embeddable chat widget. Organizations embed a JavaScript widget on their website that sends messages to this endpoint.

```
POST /org-widget-chat
```

**Auth:** API Key (`x-api-key`) with `widget:embed` scope.

**CORS:** This endpoint allows requests from **any origin** (`*`) to support embedding on third-party websites.

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

## 11. Education API

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

### 11.1 Students

Faculty-only endpoints for managing student records.

```
GET  /education-students                              — List students
GET  /education-students?action=export                 — Export CSV
POST /education-students?action=bulk_import            — Bulk import
POST /education-students?action=generate_key&student_id=<id> — Generate API key
```

**Auth:** Faculty JWT with `education:read` scope.

**Query Parameters (List):**

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `status` | string | — | — | `active`, `inactive`, `suspended` |
| `ethics_certified` | boolean | — | — | Filter by certification status |
| `semester_id` | string | — | — | Filter by semester |
| `page` | int | 1 | — | Page number |
| `limit` | int | 20 | 100 | Items per page |

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

**Export (GET with `action=export`):**

Returns a CSV file with columns: `name`, `email`, `student_id_external`, `status`, `ethics_certified`, `api_calls_used`, `last_active_at`.

---

### 11.2 Assignments

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

### 11.3 Projects & File Uploads

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

> **Batch limit:** Maximum 50 projects per batch grade request.

#### File Uploads

File uploads for projects (reports, notebooks, datasets) are handled via **Supabase Storage**, not through the API directly.

| Property | Value |
|---|---|
| Upload method | Supabase Storage SDK or `secure-storage-upload` edge function |
| Max file size | **10 MB** per file |
| Supported types | PDF, DOCX, CSV, XLSX, JSON, PNG, JPG, ZIP |
| Storage bucket | `project-files` (private, per-organization) |
| Access control | RLS — students can upload to their own project folder; faculty can read all |

**Upload flow:**
1. Student submits project via `POST /education-projects` with metadata
2. Student uploads files to Supabase Storage under `project-files/{org_id}/{student_id}/{project_id}/`
3. The `repo_url` field can alternatively point to an external repository

**Knowledge base file uploads (NGO API):**

Organizations can upload files to the knowledge base via Supabase Storage:

| Property | Value |
|---|---|
| Bucket | `knowledge-base-files` |
| Max file size | **10 MB** |
| Supported types | PDF, DOCX, TXT, MD |
| Access | Organization members only |

---

### 11.4 Ethics Certification

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

> ✅ The threshold is **80%**. Students who fail can retake immediately. The API key is only shown on the first passing attempt.

---

### 11.5 Sandbox

Synthetic data environment for student assignments. Returns realistic but fictional case data in English, Swahili, and Sheng.

```
GET /education-sandbox
```

**Auth:** Student API key with `education:read` scope.

**Query Parameters:**

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `data_type` | string | `cases` | — | `cases`, `clients`, `services`, `outcomes` |
| `language` | string | `en` | — | `en`, `sw`, `sheng` |
| `limit` | int | 50 | 500 | Records to return |

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

### 11.6 Analytics

Organization-level API usage analytics (faculty only).

```
GET /education-analytics
```

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `period` | string | `week` | `day`, `week`, `month` |
| `student_id` | string | — | Filter by student |
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max: 100) |

---

### 11.7 Faculty Management

```
GET  /education-faculty                — List faculty members
POST /education-faculty                — Add faculty member
PUT  /education-faculty                — Update faculty role/permissions
```

**Auth:** Faculty JWT with admin or owner role.

---

### 11.8 Rate Limits (Education)

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

### 11.9 Documentation

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

### 11.10 Anonymization

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

### 11.11 Citations

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

### 11.12 Semester Lifecycle

Understanding what happens to data and access when a semester ends.

#### Automatic Behaviors

| Event | What Happens |
|---|---|
| Semester `end_date` passes | Semester `is_active` is checked on each API call |
| Student in inactive semester | Rate limit drops to **0** (API access disabled) |
| New semester created | Students must be re-enrolled or migrated |

#### Student Status Transitions

```
Active semester → Semester ends → Rate limit = 0 → Student status unchanged
                                                  → API key remains valid but rate-limited
                                                  → Projects remain accessible (read-only)
```

#### Data Accessibility After Semester

| Data Type | After Semester | Duration |
|---|---|---|
| Student records | Read-only via faculty portal | Indefinite |
| Project submissions | Read-only for student and faculty | Indefinite |
| Grades | Read-only | Indefinite |
| API usage logs | Accessible via analytics | 12 months |
| Sandbox data | Refreshed per batch cycle | Until next refresh |

#### Re-enrollment

Students can be re-enrolled in a new semester by faculty:
1. Create new semester via portal or API
2. Update student's `semester_id` to the new semester
3. Student's rate limit reactivates automatically

> Students are **not** automatically deactivated. Their API key remains valid but rate-limited to 0 requests until re-enrolled in an active semester.

---

## 12. Moodle LTI 1.3 Integration

GLO integrates with Moodle via LTI 1.3 for SSO, auto-enrollment, assignment deep linking, and grade passback.

### LTI Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/lti-login` | POST | OIDC login initiation |
| `/lti-launch` | POST | Resource link launch (signed JWT) |
| `/lti-deeplink` | POST | Content selection for assignment linking |
| `/lti-jwks` | GET | GLO's public RSA keyset |

> ⚠️ **Implementation status:** These LTI edge functions are defined in the technical specification but are **not yet deployed in production**. Contact tech@projectglo.org for integration timeline.

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

## 13. Embeddable Chat Widget

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
| `data-primary-color` | ❌ | `#7c3aed` | Widget accent color (hex) |
| `data-language` | ❌ | `en` | Default language (`en`, `sw`, `sheng`) |
| `data-position` | ❌ | `bottom-right` | Widget position: `bottom-right`, `bottom-left` |
| `data-greeting` | ❌ | `"Hello! How can I help you today?"` | Custom greeting message |
| `data-disable-voice` | ❌ | `false` | Set to `true` to hide voice input button |
| `data-disable-tts` | ❌ | `false` | Set to `true` to hide text-to-speech button |

### Custom Styling

The widget renders inside a Shadow DOM to prevent CSS conflicts with the host page. To customize beyond `data-primary-color`, inject a `<style>` tag targeting the widget's custom properties:

```html
<style>
  glo-chat-widget {
    --glo-primary: #1a7f5a;
    --glo-primary-foreground: #ffffff;
    --glo-border-radius: 12px;
    --glo-font-family: 'Inter', sans-serif;
    --glo-max-height: 500px;
  }
</style>
```

> **Limitation:** Deep CSS customization beyond these variables is not supported. The widget's internal layout is not customizable.

### Widget Behavior

- Sends messages to `POST /org-widget-chat` with the configured API key
- Maintains session continuity via `session_token`
- Responses are generated from the organization's knowledge base using AI (Gemini 3 Flash)
- Falls back to keyword matching if AI is unavailable
- Supports English, Swahili, and Sheng
- Trauma-informed, culturally sensitive response style

---

## 14. Webhooks & Notifications

### Outbound Webhooks

> ⚠️ **Status:** Outbound webhooks for organizations are **planned but not yet implemented**. Currently, organizations must poll the API for updates.

**Planned webhook events:**

| Event | Payload | Trigger |
|---|---|---|
| `case.created` | Case object | New case created |
| `case.status_changed` | Case + old/new status | Status update |
| `intake.submitted` | Submission object | New intake form response |
| `widget.escalation` | Chat session + message | AI detects human intervention needed |

**Planned configuration:** Organizations will register webhook URLs via the Partner Portal or API, with HMAC-SHA256 signature verification on each delivery.

**In the meantime**, organizations can:
- Use the **Activity Log** (`GET /org-reports?report_type=activity`) to poll for changes
- Check the admin dashboard for real-time notifications
- Set up Supabase Realtime subscriptions (requires JWT auth)

### Auth Notifications

Login events trigger email notifications via the `auth-notification` edge function. Notifications are sent **once per session** (deduplicated by user ID using a ref guard) to prevent duplicate emails during token refreshes.

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

Critical tables have audit triggers recording all INSERT, UPDATE, and DELETE operations in `audit_trail` with before/after data snapshots and changed field tracking. Audit records are **immutable** — they cannot be updated or deleted, even by admins.

---

## 15. Testing & Sandbox Environment

### Education Sandbox (Students)

The Education API includes a built-in synthetic data sandbox (see [Section 11.5](#115-sandbox)). This provides realistic but fictional case data for student assignments without exposing real data.

### NGO API Testing

There is currently **no separate staging environment** or test API keys. Organizations test against the production API with their real API key.

**Recommended testing approach:**

1. Create a dedicated "test" API key with limited scopes
2. Create test knowledge base entries tagged with `category: "test"`
3. Create test cases with a naming convention (e.g., `TEST-0001`)
4. Use the widget on a staging/localhost page before deploying to production
5. Clean up test data after validation

**Planned:** A dedicated sandbox mode where API keys created with `"sandbox": true` route to isolated test data. This will be announced in the changelog.

### Local Development

For local development against the API:

1. Use `http://localhost:3000` (included in CORS allowed origins)
2. Pass your API key in `x-api-key` header
3. All endpoints are accessible from localhost

---

## 16. Data Retention Policy

### Active Data

| Data Type | Retention | Notes |
|---|---|---|
| Organization data | **Indefinite** | Retained while organization is active |
| Knowledge base entries | **Indefinite** | Soft-deleted entries retained for 90 days, then hard-deleted |
| Cases & case notes | **Indefinite** | Retained while organization is active |
| Intake submissions | **2 years** | Auto-archived after 2 years; exportable before archival |
| Widget chat sessions | **12 months** | Anonymized after 12 months, deleted after 24 months |
| Contact submissions | **12 months** | Subject to admin-initiated cleanup via `contact-data-cleanup` |

### Education Data

| Data Type | Retention | Notes |
|---|---|---|
| Student records | **Indefinite** | Status set to `inactive` but records retained for academic continuity |
| Project submissions | **Indefinite** | Read-only after semester ends; faculty can always access |
| API usage logs | **12 months** | Aggregated after 12 months; raw logs deleted |
| Ethics certifications | **Indefinite** | Required for academic records |
| Sandbox data | **Refreshed periodically** | Synthetic data is regenerated; old batches replaced |
| Anonymization logs | **24 months** | Required for data governance audits |

### Audit Data

| Data Type | Retention | Notes |
|---|---|---|
| Audit trail | **Indefinite** | Immutable — never deleted |
| Security logs | **12 months** | Required for compliance |
| Activity log | **24 months** | Organization-scoped |

### Data Deletion Requests

Organizations can request full data deletion by contacting support@projectglo.org. Per GDPR/Kenya Data Protection Act requirements:
- Data deletion is completed within **30 days**
- Audit trail entries are anonymized but not deleted
- A confirmation is sent to the registered contact email

---

## 17. SLA & Performance

### Expected Response Times

| Endpoint Category | p50 | p95 | p99 |
|---|---|---|---|
| Knowledge base CRUD | 120ms | 350ms | 800ms |
| Case management | 150ms | 400ms | 900ms |
| Widget chat (AI) | 1.5s | 4s | 8s |
| Widget chat (keyword fallback) | 200ms | 500ms | 1s |
| Education sandbox | 100ms | 300ms | 700ms |
| Batch grade (50 projects) | 2s | 5s | 10s |

> Response times measured from edge function invocation to response. Network latency varies by client location.

### Availability

| Property | Target |
|---|---|
| Monthly uptime | **99.5%** |
| Planned maintenance | Announced 48h in advance via email |
| Unplanned downtime | Post-incident report within 72h |
| Infrastructure | Supabase (AWS) — edge functions distributed globally |

### Status Page

A status page at `https://status.projectglo.org` is planned. In the meantime, check:
- Supabase status: https://status.supabase.com
- Contact support@projectglo.org for outage inquiries

---

## 18. Common Use Cases

### NGO: Add a chatbot to your website

1. **Register** your organization → receive API key
2. **Populate** knowledge base with your FAQs, service info, and resources
3. **Embed** the widget script on your website
4. **Monitor** conversations and escalations via the admin dashboard
5. **Iterate** — add more knowledge base entries based on common questions

### NGO: Track client cases

1. **Create** cases with unique case numbers
2. **Assign** cases to caseworkers
3. **Add notes** as the case progresses
4. **Update status** through the lifecycle: `open` → `in_progress` → `closed`
5. **Generate reports** for donors and stakeholders

### University: Full Moodle integration

1. **IT admin** configures LTI 1.3 in Moodle (see [Section 12](#12-moodle-lti-13-integration))
2. **Faculty** creates semester and assignments via Partner Portal
3. **Students** auto-enroll on first Moodle launch
4. **Students** complete ethics quiz → receive API key
5. **Students** use sandbox data for assignments
6. **Faculty** grades projects → grades sync to Moodle gradebook

### University: Standalone (no Moodle)

1. **Faculty** registers organization and creates semester
2. **Faculty** bulk-imports students via CSV
3. **Students** register at `/student-register/<org-slug>`
4. **Students** complete ethics quiz in the Student Portal
5. **Faculty** creates assignments, students submit projects
6. **Faculty** reviews and grades via portal or API

---

## 19. Troubleshooting

### 401 Unauthorized

| Symptom | Likely Cause | Fix |
|---|---|---|
| All requests return 401 | API key is incorrect | Verify the key — check for trailing spaces |
| Worked before, now 401 | Key was revoked | Check key status in Partner Portal |
| JWT-based request fails | Token expired | Refresh the token (Supabase SDK does this automatically) |
| Education endpoint fails | Student not ethics-certified | Complete the ethics quiz first |

### 403 Forbidden

| Symptom | Likely Cause | Fix |
|---|---|---|
| Can read but not write | Key missing write scopes | Create a new key with required scopes |
| Faculty action denied | User not in `organization_members` | Add user as org member with faculty role |
| Cross-org access denied | API key scoped to different org | Use the correct org's API key |

### 429 Rate Limited

| Symptom | Fix |
|---|---|
| NGO API rate limited | Wait until `X-RateLimit-Reset` timestamp. Default: 60 req/min. Contact support for increase. |
| Student rate limited | Check `GET /education-rate-limits`. Wait for daily reset (UTC midnight). |
| Off-semester student | Rate limit is 0. Re-enroll in an active semester. |

### 500 Internal Server Error

| Symptom | Fix |
|---|---|
| Intermittent 500s | Retry with exponential backoff. Report to support if persistent. |
| Consistent 500 on one endpoint | Check request body for malformed JSON. Report to support. |
| AI chat timeout | The AI gateway may be overloaded. Widget falls back to keyword matching automatically. |

### Widget Not Loading

| Symptom | Fix |
|---|---|
| Widget doesn't appear | Check browser console for script errors. Verify the script URL is correct. |
| Widget shows but doesn't respond | Check API key has `widget:embed` scope. Check browser network tab for 401/403. |
| CORS error in console | The widget endpoint allows all origins. If you see CORS errors, the script URL may be wrong. |

---

## 20. Code Examples

### JavaScript (fetch)

```javascript
// List knowledge base entries
const response = await fetch(
  'https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-knowledge-base?limit=10',
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'glo_your_api_key_here'
    }
  }
);
const data = await response.json();
console.log(data.entries);
```

```javascript
// Create a case
const response = await fetch(
  'https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-cases',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'glo_your_api_key_here'
    },
    body: JSON.stringify({
      case_number: 'NWS-2026-0043',
      client_name: 'Jane D.',
      category: 'legal_aid',
      priority: 'high',
      description: 'Client needs legal representation.'
    })
  }
);
```

### Python (requests)

```python
import requests

BASE_URL = "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1"
API_KEY = "glo_your_api_key_here"

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

# List cases
response = requests.get(
    f"{BASE_URL}/org-cases",
    headers=headers,
    params={"status": "open", "limit": 50}
)
cases = response.json()["cases"]
print(f"Found {len(cases)} open cases")

# Create knowledge base entry
response = requests.post(
    f"{BASE_URL}/org-knowledge-base",
    headers=headers,
    json={
        "title": "Emergency Contacts",
        "content": "Call 999 for police, 112 for ambulance...",
        "category": "emergency",
        "language": "en"
    }
)
print(response.json())
```

### PHP

```php
<?php
$baseUrl = "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1";
$apiKey = "glo_your_api_key_here";

// List knowledge base entries
$ch = curl_init("$baseUrl/org-knowledge-base?limit=10");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: $apiKey"
    ]
]);
$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

foreach ($data['entries'] as $entry) {
    echo $entry['title'] . "\n";
}
```

### Ruby

```ruby
require 'net/http'
require 'json'

base_url = "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1"
api_key = "glo_your_api_key_here"

# List cases
uri = URI("#{base_url}/org-cases?status=open&limit=10")
req = Net::HTTP::Get.new(uri)
req['Content-Type'] = 'application/json'
req['x-api-key'] = api_key

res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http|
  http.request(req)
}

cases = JSON.parse(res.body)['cases']
puts "Found #{cases.length} open cases"
```

### cURL

```bash
# List knowledge base entries
curl -s "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-knowledge-base?limit=10" \
  -H "x-api-key: glo_YOUR_KEY" | jq '.entries[].title'

# Create a case
curl -X POST "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: glo_YOUR_KEY" \
  -d '{
    "case_number": "NWS-2026-0043",
    "client_name": "Jane D.",
    "category": "legal_aid",
    "priority": "high"
  }'

# Widget chat test
curl -X POST "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-widget-chat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: glo_YOUR_KEY" \
  -d '{"message": "What services do you offer?", "language": "en"}'
```

---

## 21. Changelog

### v2.1.0 (2026-03-15)

- **Added:** Quick Start guide
- **Added:** Comprehensive pagination documentation for all endpoints
- **Added:** Versioning strategy and deprecation policy
- **Added:** Timestamps & timezone documentation (UTC)
- **Added:** CORS policy documentation
- **Added:** File upload specifications for projects and knowledge base
- **Added:** Case search field documentation
- **Added:** Detailed rate limit behavior (per-key, headers, reset, 429 response)
- **Added:** Semester lifecycle documentation
- **Added:** Widget customization options (greeting, CSS variables, feature toggles)
- **Added:** Testing & sandbox environment guidance
- **Added:** Data retention policy
- **Added:** SLA & performance targets
- **Added:** Common use cases
- **Added:** Troubleshooting guide
- **Added:** Code examples in JavaScript, Python, PHP, Ruby
- **Added:** Authentication token lifetime documentation
- **Added:** Webhook status clarification (planned, not yet implemented)
- **Clarified:** LTI endpoints are specified but not yet deployed

### v2.0.0 (2026-03-15)

- **Added:** Education API (full academic tier)
- **Added:** Moodle LTI 1.3 integration specification
- **Added:** Ethics certification gate
- **Added:** Synthetic data sandbox with HMAC-SHA256 anonymization
- **Added:** Batch grading (up to 50 projects)
- **Added:** Faculty management endpoints
- **Added:** Citation generator
- **Breaking:** API keys now require scopes (previously all-access)

### v1.1.0 (2025-12-01)

- **Added:** Intake forms with JSON Schema
- **Added:** Widget multilingual support (Swahili, Sheng)
- **Added:** Case notes with note types
- **Added:** Activity logging for all mutations
- **Added:** Reports endpoint with date range filtering

### v1.0.0 (2025-09-01)

- Initial release
- Organization registration and API key management
- Knowledge base CRUD
- Basic case management
- Embeddable chat widget
- AI chat processing (OpenAI GPT)

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
| `/lti-login` | POST | LTI 1.3 | OIDC login initiation ⚠️ |
| `/lti-launch` | POST | LTI 1.3 | Resource link launch ⚠️ |
| `/lti-deeplink` | POST | LTI 1.3 | Assignment deep linking ⚠️ |
| `/lti-jwks` | GET | Public | GLO public keyset ⚠️ |
| `/ai-chat-processor` | POST | JWT | Authenticated AI chat |
| `/ai-chat-public` | POST | Public | Public AI chat |
| `/search-knowledge` | POST | Public | Knowledge search |

> ⚠️ = Specified but not yet deployed in production.

## Appendix B: Confirmation Checklist

| Question | Answer |
|---|---|
| Are all NGO endpoints implemented? | ✅ Yes |
| Are all Education endpoints implemented? | ✅ Yes |
| Are Moodle LTI endpoints implemented? | ❌ Specified only — not deployed |
| Is the base URL correct? | ✅ `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1` |
| Is the widget URL correct? | ✅ `https://project-glo.lovable.app/widget/glo-chat-widget.js` |
| Are rate limits accurately described? | ✅ Per-key for NGO, per-student for Education |
| Is the ethics quiz threshold 80%? | ✅ Yes — configured in `education-ethics` function |
| Do API keys follow `glo_<32hex>` format? | ✅ Yes |
| Is batch grading limited to 50? | ✅ Yes |
| Are webhooks supported? | ❌ Planned, not implemented |
| Is there a staging environment? | ❌ No — sandbox data available for Education tier |
| What's the CORS policy? | ✅ Documented in Section 9 |
| What's the data retention policy? | ✅ Documented in Section 16 |
| Can users upload files? | ✅ Via Supabase Storage — 10MB limit |

---

**Document Version:** 2.1.0  
**Last Updated:** 2026-03-15  
**Classification:** Technical — External Distribution OK  
**Contact:** tech@projectglo.org
