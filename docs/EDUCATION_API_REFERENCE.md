# GLO Education API — Complete Reference

**Version:** 2.1.0  
**Last Updated:** 2026-03-15  
**Base URL:** `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1`

---

## ⚠️ Moodle LTI 1.3 Status

> **Moodle LTI integration is NOT live.** The LTI endpoints (`/lti-login`, `/lti-launch`, `/lti-jwks`, `/lti-deeplink`) are specified in the technical design ([docs/MOODLE_LTI_INTEGRATION.md](./MOODLE_LTI_INTEGRATION.md)) but **have not been implemented or deployed**. No edge functions exist for LTI. See [Section 13](#13-moodle-lti-13-integration-not-implemented) for the planned specification.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Authentication](#2-authentication)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Pagination](#5-pagination)
6. [Organization Setup](#6-organization-setup--education-setup)
7. [Student Management](#7-student-management--education-students)
8. [Ethics Certification](#8-ethics-certification--education-ethics)
9. [Assignments](#9-assignments--education-assignments)
10. [Projects](#10-projects--education-projects)
11. [Sandbox (Synthetic Data)](#11-sandbox--education-sandbox)
12. [Analytics](#12-analytics--education-analytics)
13. [Faculty Dashboard](#13-faculty-dashboard--education-faculty)
14. [Rate Limit Management](#14-rate-limit-management--education-rate-limits)
15. [Anonymization](#15-anonymization--education-anonymize)
16. [Citations](#16-citations--education-citation)
17. [Documentation Endpoint](#17-documentation--education-docs)
18. [Moodle LTI 1.3 Integration (NOT IMPLEMENTED)](#18-moodle-lti-13-integration-not-implemented)
19. [Semester Lifecycle](#19-semester-lifecycle)
20. [Data Retention](#20-data-retention)
21. [Troubleshooting](#21-troubleshooting)
22. [Code Examples](#22-code-examples)

---

## 1. Quick Start

### University IT Admin — Full setup in 5 steps

```bash
# 1. Register your education organization (requires a GLO JWT)
curl -X POST $BASE_URL/education-setup \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "University of Nairobi",
    "slug": "uon",
    "contact_email": "it@uon.ac.ke",
    "semester_name": "Spring 2026",
    "semester_start": "2026-01-15",
    "semester_end": "2026-05-30",
    "student_capacity": 80
  }'
# → Returns: organization_id, semester, api_key (SAVE IT!)

# 2. Bulk-import students
curl -X POST "$BASE_URL/education-students?action=import" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "semester_id": "<semester_uuid>",
    "students": [
      {"student_id": "STU001", "name": "Jane Doe", "email": "jane@uon.ac.ke"},
      {"student_id": "STU002", "name": "John Otieno", "email": "john@uon.ac.ke"}
    ]
  }'
# → Returns: cohort_api_key (distribute to students)

# 3. Students complete ethics quiz (80% minimum score)
curl -X POST $BASE_URL/education-ethics \
  -H "x-api-key: <student_api_key>" \
  -H "Content-Type: application/json" \
  -d '{"quiz_score": 85, "cert_id": "CERT-2026-001"}'

# 4. Students access sandbox data
curl "$BASE_URL/education-sandbox?type=cases&lang=en&page=1&limit=10" \
  -H "x-api-key: <student_api_key>"

# 5. Faculty reviews projects
curl -X POST "$BASE_URL/education-projects?action=batch-review" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"reviews": [{"project_id": "<uuid>", "grade": "A", "status": "reviewed"}]}'
```

---

## 2. Authentication

All education endpoints use a **unified auth module** (`_shared/edu-auth.ts`) supporting three auth methods:

### 2.1 Student API Key (`x-api-key` header)

Issued during student import. SHA-256 hashed before storage.

| Property | Value |
|---|---|
| Format | `glo_stu_<32hex>` |
| Hash | SHA-256 (server-side) |
| Expiration | **Never** — deactivated when student status → `inactive`/`suspended` |
| Scopes | `education:read`, `sandbox:read`, `projects:write` |

```bash
curl -H "x-api-key: glo_stu_abc123..." $BASE_URL/education-sandbox?type=cases
```

### 2.2 Organization API Key (`x-api-key` header)

Issued during education setup. For server-to-server integration.

| Property | Value |
|---|---|
| Format | `glo_edu_<32hex>` |
| Scopes | Configurable: `education:read`, `sandbox:read`, `docs:read` |

### 2.3 JWT Bearer Token (Faculty/Admin)

For portal-based access. Must belong to a user in `organization_members` with an education-tier org.

| Property | Value |
|---|---|
| Lifetime | 1 hour (auto-refreshed by Supabase SDK) |
| Refresh token | 7 days |
| Scopes | `*` (all scopes, access controlled by role) |

```bash
curl -H "Authorization: Bearer <jwt>" $BASE_URL/education-faculty?action=dashboard
```

### Role Hierarchy

| Role | Can access |
|---|---|
| `owner` | Everything |
| `admin` | Everything |
| `faculty` | All education endpoints, student management, grading |
| `api_key` | Scoped to assigned scopes |
| `student` | Own data only; sandbox; projects |

---

## 3. Error Handling

All errors return:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Error Codes

| Code | HTTP | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing/invalid credentials |
| `FORBIDDEN` | 403 | Insufficient role or scope |
| `SCOPE_REQUIRED` | 403 | API key missing required scope (includes `required_scope` and `current_scopes` in response) |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `NOT_FOUND` | 404 | Resource not found |
| `CAPACITY_EXCEEDED` | 400 | Student import exceeds semester capacity |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `DUPLICATE` | 409 | Duplicate resource |
| `ETHICS_REQUIRED` | 400 | Ethics quiz score below threshold (includes `minimum_required` and `your_score`) |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 4. Rate Limiting

### Student Rate Limits (per student, daily, UTC midnight reset)

| Context | Requests/Day |
|---|---|
| Normal usage | 100 |
| Active assignment period | 500 |
| Off-semester | 0 (disabled) |
| Faculty override | Custom per-student |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710547200
```

### 429 Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retry_after": 3600
}
```

---

## 5. Pagination

All list endpoints use **page-based pagination**:

| Parameter | Default | Max | Description |
|---|---|---|---|
| `page` | 1 | — | Page number (1-indexed) |
| `limit` | 50 | 200 | Items per page |

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 142,
    "total_pages": 3,
    "has_more": true
  }
}
```

---

## 6. Organization Setup — `education-setup`

**Endpoint:** `POST /education-setup`  
**Auth:** JWT (Bearer token)  
**Method:** POST only

Creates (or upgrades) an organization to the `education` tier with an initial semester and API key.

### Request Body

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✅ | — | Organization name |
| `slug` | string | ✅ | — | URL-safe identifier (`^[a-z0-9-]+$`) |
| `contact_email` | string | ✅ | — | Admin contact email |
| `contact_phone` | string | — | null | Phone number |
| `website` | string | — | null | Organization website |
| `description` | string | — | null | Description |
| `semester_name` | string | — | `Semester {year}` | First semester name |
| `semester_start` | date | ✅ | — | Semester start date |
| `semester_end` | date | ✅ | — | Semester end date |
| `student_capacity` | int | — | 40 | Max students per semester |
| `sandbox_enabled` | bool | — | true | Enable synthetic data sandbox |
| `anonymization_enabled` | bool | — | true | Enable PII anonymization |
| `rate_limit_normal` | int | — | 100 | Daily rate limit (normal) |
| `rate_limit_assignment` | int | — | 500 | Daily rate limit (assignments) |
| `rate_limit_off_semester` | int | — | 0 | Daily rate limit (off-semester) |

### Response (201)

```json
{
  "organization_id": "uuid",
  "semester": { "id": "uuid", "name": "Spring 2026", "start_date": "...", "end_date": "..." },
  "api_key": "glo_edu_abc123...",
  "settings": { "sandbox_enabled": true, "anonymization_enabled": true, ... },
  "message": "Education organization created. Save the API key — it will not be shown again."
}
```

### Error Responses

| Status | When |
|---|---|
| 400 | Missing required fields or invalid slug format |
| 409 | Slug already exists |

---

## 7. Student Management — `education-students`

**Endpoint:** `/education-students`  
**Auth:** JWT (faculty/admin only)  
**Required scope:** `education:read` (GET), `education:write` (POST)

### GET — List Students

```
GET /education-students?page=1&limit=50&semester_id=<uuid>
```

| Parameter | Required | Description |
|---|---|---|
| `semester_id` | — | Filter by semester |
| `page` | — | Page number (default: 1) |
| `limit` | — | Items per page (default: 50, max: 200) |

Returns paginated student list.

### GET — Export Students (CSV)

```
GET /education-students?action=export
```

Returns CSV file with columns: `student_id, name, email, status, ethics_certified, last_active_at, created_at`

### POST — Bulk Import Students

```
POST /education-students?action=import
```

```json
{
  "semester_id": "<uuid>",
  "students": [
    { "student_id": "STU001", "name": "Jane Doe", "email": "jane@uon.ac.ke" },
    { "student_id": "STU002", "name": "John Otieno", "email": "john@uon.ac.ke" }
  ]
}
```

**Response (201):**

```json
{
  "imported": 2,
  "cohort_api_key": "glo_stu_abc123...",
  "message": "Save the cohort API key — it will not be shown again."
}
```

**Capacity check:** If `existing_students + importing_count > semester.student_capacity`, returns `CAPACITY_EXCEEDED` (400).

### POST — Suspend/Reactivate Student

```
POST /education-students?action=suspend
POST /education-students?action=reactivate
```

```json
{ "student_id": "<uuid>" }
```

---

## 8. Ethics Certification — `education-ethics`

**Endpoint:** `/education-ethics`  
**Auth:** Student API key or JWT

### GET — Check Ethics Status

```
GET /education-ethics
```

**Response:**

```json
{
  "student_id": "uuid",
  "ethics_certified": false,
  "ethics_certified_at": null,
  "ethics_cert_id": null,
  "ethics_quiz_score": null
}
```

### POST — Submit Ethics Certification

```
POST /education-ethics
```

```json
{
  "quiz_score": 85,
  "cert_id": "CERT-2026-001"
}
```

**Minimum score:** Configurable per-org via `organizations.settings.ethics_min_score`. Default: **80**.

**Success response:**

```json
{
  "success": true,
  "ethics_certified": true,
  "message": "Ethics certification recorded. API access is now enabled."
}
```

**Failure response (score too low):**

```json
{
  "error": "Quiz score below minimum threshold",
  "code": "ETHICS_REQUIRED",
  "minimum_required": 80,
  "your_score": 65
}
```

---

## 9. Assignments — `education-assignments`

**Endpoint:** `/education-assignments`  
**Auth:** API key or JWT

### GET — List Assignments

```
GET /education-assignments?page=1&limit=50
```

| Filter | Description |
|---|---|
| `semester_id` | Filter by semester |
| `active_only=true` | Only active assignments |

### GET — Assignment Detail

```
GET /education-assignments?action=detail&assignment_id=<uuid>
```

Returns assignment with related semester info and `project_count`.

### POST — Create Assignment (Faculty)

```
POST /education-assignments?action=create
```

```json
{
  "title": "API Integration Analysis",
  "description": "Analyze GBV case data patterns using the sandbox API",
  "difficulty": "beginner",
  "semester_id": "<uuid>",
  "deadline": "2026-04-15T23:59:59Z",
  "starter_query": "GET /education-sandbox?type=cases&lang=en",
  "rate_override_per_day": 300
}
```

| Field | Type | Required | Default |
|---|---|---|---|
| `title` | string | ✅ | — |
| `description` | string | — | null |
| `difficulty` | string | — | `beginner` (options: `beginner`, `intermediate`, `advanced`) |
| `semester_id` | uuid | — | null |
| `deadline` | ISO timestamp | — | null |
| `starter_query` | string | — | null |
| `rate_override_per_day` | int | — | null |

### POST — Update Assignment (Faculty)

```
POST /education-assignments?action=update
```

Allowed fields: `title`, `description`, `difficulty`, `deadline`, `starter_query`, `rate_override_per_day`, `is_active`

### POST — Activate/Deactivate Assignment (Faculty)

```
POST /education-assignments?action=activate
POST /education-assignments?action=deactivate
```

```json
{ "assignment_id": "<uuid>" }
```

---

## 10. Projects — `education-projects`

**Endpoint:** `/education-projects`  
**Auth:** API key or JWT

### GET — List Projects

```
GET /education-projects?page=1&limit=50
```

| Filter | Description |
|---|---|
| `status` | Filter by status (`draft`, `submitted`, `reviewed`, `returned`) |
| `assignment_id` | Filter by assignment |

**Students** see only their own projects. **Faculty** see all org projects.

### GET — Project Detail

```
GET /education-projects?action=detail&project_id=<uuid>
```

Returns project with related student and assignment data.

### POST — Create Project (Student)

```
POST /education-projects?action=create
```

**Required scope:** `projects:write`

```json
{
  "title": "GBV Pattern Analysis — Nairobi",
  "description": "Analyzing case distribution patterns across Nairobi subcounties",
  "type": "analysis",
  "assignment_id": "<uuid>",
  "repo_url": "https://github.com/student/project"
}
```

| Field | Default |
|---|---|
| `type` | `analysis` |
| `status` | `draft` (auto-set) |

### POST — Submit Project (Student)

```
POST /education-projects?action=submit
```

```json
{ "project_id": "<uuid>" }
```

Sets status to `submitted` and records `submitted_at` timestamp.

### POST — Update Draft Project (Student)

```
POST /education-projects?action=update
```

Students can only update projects with `status: draft`. Faculty can update any project.

```json
{
  "project_id": "<uuid>",
  "title": "Updated Title",
  "description": "Updated description",
  "repo_url": "https://github.com/...",
  "endpoints_used": ["/education-sandbox?type=cases"],
  "datasets_used": ["sandbox_cases_en"]
}
```

### POST — Review Project (Faculty)

```
POST /education-projects?action=review
```

**Required scope:** `education:write`

```json
{
  "project_id": "<uuid>",
  "grade": "A",
  "faculty_comments": "Excellent analysis of spatial patterns.",
  "status": "reviewed"
}
```

### POST — Batch Review (Faculty) ⚡

```
POST /education-projects?action=batch-review
```

**Max 50 reviews per batch.**

```json
{
  "reviews": [
    { "project_id": "<uuid1>", "grade": "A", "status": "reviewed" },
    { "project_id": "<uuid2>", "grade": "B+", "faculty_comments": "Good work", "status": "reviewed" },
    { "project_id": "<uuid3>", "grade": "C", "status": "returned", "faculty_comments": "Needs revision" }
  ]
}
```

**Response:**

```json
{
  "results": [
    { "project_id": "<uuid1>", "success": true },
    { "project_id": "<uuid2>", "success": true },
    { "project_id": "<uuid3>", "success": true }
  ],
  "summary": { "total": 3, "succeeded": 3, "failed": 0 }
}
```

---

## 11. Sandbox — `education-sandbox`

**Endpoint:** `GET /education-sandbox`  
**Auth:** API key or JWT  
**Required scope:** `sandbox:read`

Returns **synthetic, anonymized data** for student analysis. No real PII is exposed.

### Parameters

| Parameter | Required | Default | Options |
|---|---|---|---|
| `type` | — | `cases` | `cases`, `notes`, `intake` |
| `lang` | — | `en` | `en`, `sw` (Swahili), `sheng` |
| `page` | — | 1 | — |
| `limit` | — | 50 | Max: 100 |
| `category` | — | — | Filter cases by category |
| `case_id` | — | random | For `type=notes`, specify parent case |

### Data Types

**Cases** (`type=cases`): 500 synthetic records

```json
{
  "case_id": "CASE-0001",
  "category": "protection",
  "status": "open",
  "priority": "high",
  "county": "Nairobi",
  "subcounty": "Westlands",
  "description": "Client seeking shelter after domestic incident...",
  "opened_at": "2025-06-15T10:30:00Z",
  "closed_at": null,
  "tags": ["protection", "urgent"],
  "anonymized": true
}
```

**Notes** (`type=notes`): Up to 50 per case

```json
{
  "note_id": "NOTE-0001",
  "case_id": "CASE-0042",
  "note_type": "assessment",
  "content": "Initial assessment completed. Client presents with moderate anxiety...",
  "created_at": "2025-06-16T14:00:00Z",
  "anonymized": true
}
```

**Intake** (`type=intake`): 300 synthetic submissions

```json
{
  "submission_id": "INTAKE-0001",
  "form_type": "general_intake",
  "status": "reviewed",
  "priority": "medium",
  "county": "Kisumu",
  "responses_summary": "Young person requesting educational support...",
  "created_at": "2025-07-01T09:00:00Z",
  "anonymized": true
}
```

### Categories (for `type=cases`)

`protection`, `shelter`, `legal_aid`, `psychosocial`, `medical`, `economic_empowerment`, `education`, `referral`

### Data Source Priority

1. Pre-generated data from `edu_sandbox_data` table (org-specific or global)
2. On-the-fly synthetic generation (deterministic per request)

### API Usage Tracking

Every sandbox request automatically:
- Updates `edu_students.last_active_at`
- Inserts a record into `edu_api_usage` with `is_sandbox: true`

---

## 12. Analytics — `education-analytics`

**Endpoint:** `GET /education-analytics`  
**Auth:** API key or JWT  
**Required scope:** `education:read`

### Student Analytics

```
GET /education-analytics?scope=student&student_id=<uuid>
```

Students can only view their own analytics. Faculty can view any student.

**Response (cached 30s):**

```json
{
  "student_id": "uuid",
  "total_calls": 47,
  "endpoints_breakdown": {
    "/education/sandbox?type=cases": 30,
    "/education/sandbox?type=notes": 12,
    "/education/sandbox?type=intake": 5
  },
  "error_rate": "2.1%",
  "active_days": 8,
  "sandbox_calls": 40,
  "live_calls": 7,
  "complexity_score": 6.5
}
```

Add `?format=csv` for CSV export.

### Cohort Analytics (Faculty only)

```
GET /education-analytics?scope=cohort
```

**Response (cached 60s):**

```json
{
  "total_students": 40,
  "active_students": 32,
  "total_api_calls": 1250,
  "average_calls_per_student": 39,
  "most_used_endpoints": [["endpoint", count], ...],
  "common_errors": [["404", 15], ...],
  "student_summary": [
    { "student_id": "uuid", "student_id_external": "STU001", "name": "Jane", "total_calls": 67, "error_count": 2, "unique_endpoints": 5 }
  ]
}
```

Add `?format=csv` for CSV export of student summary.

### Timeseries (Faculty or own student)

```
GET /education-analytics?scope=timeseries&period=daily
GET /education-analytics?scope=timeseries&period=weekly
```

| Period | Lookback |
|---|---|
| `daily` | 30 days |
| `weekly` | 90 days |

---

## 13. Faculty Dashboard — `education-faculty`

**Endpoint:** `GET /education-faculty`  
**Auth:** JWT (faculty/admin only)  
**Required scope:** `education:read`

### Dashboard Overview

```
GET /education-faculty?action=dashboard
```

**Response (cached 60s):**

```json
{
  "total_students": 80,
  "active_students": 72,
  "ethics_certified": 68,
  "api_calls_today": 342,
  "total_projects": 156,
  "pending_reviews": 12
}
```

### Student Overview

```
GET /education-faculty?action=student-overview&semester_id=<uuid>
```

Returns all students with status, ethics, last activity, and rate limit overrides.

### Suspicious Activity Detection

```
GET /education-faculty?action=suspicious-activity
```

Detects three types of academic integrity issues:

| Flag Type | Detection Logic | Severity |
|---|---|---|
| `shared_api_key` | ≥3 distinct IPs per student in 1 hour | medium (3-4 IPs), high (5+) |
| `unusual_volume` | >3× cohort average daily calls | low/medium/high based on multiplier |
| `copy_paste` | ≥80% Jaccard similarity in endpoint sequences between students | medium (80-94%), high (95%+) |

**Response:**

```json
{
  "flags": [
    { "student_id": "uuid", "flag_type": "shared_api_key", "severity": "high", "details": "5 distinct IPs in the last hour", "detected_at": "..." }
  ],
  "summary": { "total": 3, "high": 1, "medium": 1, "low": 1 },
  "checked_at": "2026-03-15T10:00:00Z"
}
```

### Usage Report

```
GET /education-faculty?action=usage-report&days=7
```

Returns raw API usage records for the specified period (max 1000 records).

---

## 14. Rate Limit Management — `education-rate-limits`

**Endpoint:** `/education-rate-limits`  
**Auth:** JWT (faculty/admin)  
**Required scope:** `education:admin`

### GET — Current Rate Limits

```
GET /education-rate-limits?action=current
```

Returns active semester settings and any student-level overrides.

### GET — List All Semesters

```
GET /education-rate-limits?action=list-semesters
```

### POST — Update Semester Rate Limits

```
POST /education-rate-limits?action=update-semester
```

```json
{
  "semester_id": "<uuid>",
  "rate_limit_normal": 150,
  "rate_limit_assignment": 750
}
```

### POST — Set Student Override

```
POST /education-rate-limits?action=student-override
```

```json
{
  "student_id": "<uuid>",
  "daily_limit": 300
}
```

### POST — Clear Student Override

```
POST /education-rate-limits?action=clear-override
```

```json
{ "student_id": "<uuid>" }
```

### POST — Create New Semester

```
POST /education-rate-limits?action=create-semester
```

```json
{
  "name": "Fall 2026",
  "start_date": "2026-08-01",
  "end_date": "2026-12-15",
  "student_capacity": 60,
  "rate_limit_normal": 100,
  "rate_limit_assignment": 500,
  "rate_limit_off_semester": 0
}
```

---

## 15. Anonymization — `education-anonymize`

**Endpoint:** `POST /education-anonymize`  
**Auth:** None (internal service) — accepts `student_id` in body  
**Note:** This is a utility function typically called internally by other endpoints.

### How It Works

Uses **HMAC-SHA256** with a per-request salt (`studentId + serviceRoleKey + timestamp`) for consistent aliasing within a single request.

### PII Handling

| Field Type | Action | Example |
|---|---|---|
| Phone, email | **Redacted** → `[REDACTED]` | `phone_number` → `[REDACTED]` |
| Names | **Aliased** → `Person-A`, `Person-B` | `client_name: "Jane"` → `Person-A` |
| Organizations | **Aliased** → `Org-A`, `Org-B` | `organization_name: "NGO X"` → `Org-A` |
| Case numbers | **Aliased** → `Case-A`, `Case-B` | `case_number: "CS-001"` → `Case-A` |
| User IDs | **Redacted** → `[REDACTED]` | `user_id`, `caseworker_id`, `created_by` |
| Addresses | **Generalized** → last 2 parts only | `"123 Main St, Westlands, Nairobi"` → `Westlands, Nairobi` |
| Nested objects | **Recursively anonymized** | `content`, `metadata`, `responses` |

### Request

```json
{
  "student_id": "<uuid>",
  "organization_id": "<uuid>",
  "endpoint": "/sandbox/cases",
  "data": [{ "client_name": "Jane Doe", "phone": "0712345678", ... }]
}
```

### Response

```json
{
  "data": [{ "client_name": "Person-A", "phone": "[REDACTED]", "anonymized": true, ... }],
  "anonymized": true
}
```

All anonymization events are logged to `edu_anonymization_log`.

---

## 16. Citations — `education-citation`

**Endpoint:** `GET /education-citation`  
**Auth:** None (public endpoint)  
**Cached:** 1 hour

### Parameters

| Parameter | Default | Options |
|---|---|---|
| `format` | `apa` | `apa`, `mla`, `chicago` |
| `access_date` | today | ISO date string |
| `version` | `1.0` | Dataset version |

### Response

```json
{
  "format": "apa",
  "citation": "Project GLO. (2026). GLO platform anonymized dataset (Version 1.0) [Data set]. Project GLO. https://projectglo.org",
  "dataset_version": "1.0",
  "access_date": "2026-03-15",
  "note": "This citation covers anonymized, synthetic data provided through the GLO Education API sandbox environment."
}
```

---

## 17. Documentation — `education-docs`

**Endpoint:** `GET /education-docs`  
**Auth:** None (public endpoint)  
**Cached:** 5 minutes

### Parameters

| Parameter | Default | Options |
|---|---|---|
| `type` | `schema` | `schema`, `examples`, `glossary` |
| `lang` | `en` | Language code |

Returns content from the `edu_docs` table.

---

## 18. Moodle LTI 1.3 Integration (NOT IMPLEMENTED)

> ⚠️ **Status: PLANNED — NOT DEPLOYED**
>
> The following endpoints are defined in the technical specification ([docs/MOODLE_LTI_INTEGRATION.md](./MOODLE_LTI_INTEGRATION.md)) but have **no edge function implementation**.

### Planned Endpoints

| Endpoint | Purpose | Status |
|---|---|---|
| `POST /lti-login` | OIDC login initiation | ❌ Not implemented |
| `POST /lti-launch` | LTI resource launch & auto-enrollment | ❌ Not implemented |
| `GET /lti-jwks` | JSON Web Key Set for token verification | ❌ Not implemented |
| `POST /lti-deeplink` | Deep linking for assignment creation | ❌ Not implemented |
| `POST /lti-grade-passback` | Grade sync to Moodle gradebook | ❌ Not implemented |

### What Would Be Needed to Go Live

1. **Implement 5 edge functions** (listed above)
2. **Create `lti_registrations` table** — stores platform credentials (client_id, deployment_id, issuer, jwks_url)
3. **Create `lti_sessions` table** — tracks OIDC state/nonce
4. **RSA key pair management** — for signing JWTs
5. **University IT configuration** — Client ID, Deployment ID, Platform Issuer URL from Moodle admin

### Planned Flow (for reference)

```
Student clicks GLO in Moodle
    → Moodle POST /lti-login (OIDC initiation)
    → Redirect to Moodle auth
    → Moodle POST /lti-launch (with id_token)
    → GLO validates token, auto-enrolls student
    → Redirects to Student Portal
    → On grade: POST /lti-grade-passback → Moodle gradebook
```

**If you need Moodle integration**, please contact the development team to prioritize implementation.

---

## 19. Semester Lifecycle

### What Happens When a Semester Ends

| Event | Behavior |
|---|---|
| Semester `end_date` passes | Students retain `active` status (no auto-deactivation) |
| Off-semester rate limit | If `rate_limit_off_semester: 0`, API access is effectively blocked |
| Student data | Projects and submissions remain accessible indefinitely |
| New semester | Create via `education-rate-limits?action=create-semester` |
| Student migration | Re-import students with new `semester_id` |

### Recommended Admin Actions at Semester End

1. Export student data: `GET /education-students?action=export`
2. Export analytics: `GET /education-analytics?scope=cohort&format=csv`
3. Review all pending projects: `GET /education-projects?status=submitted`
4. Create new semester: `POST /education-rate-limits?action=create-semester`
5. Optionally suspend graduating students: `POST /education-students?action=suspend`

---

## 20. Data Retention

| Data Type | Retention | Deletable? |
|---|---|---|
| Student records | Indefinite | Faculty can suspend (soft delete) |
| Projects & submissions | Indefinite | No |
| API usage logs (`edu_api_usage`) | 12 months | No |
| Anonymization logs | Indefinite | No |
| Sandbox data | Regenerated periodically | N/A |
| Audit trail (`org_activity_log`) | Indefinite | No |

All timestamps are **UTC** (ISO 8601 format).

---

## 21. Troubleshooting

### Common Errors

**401 Unauthorized**
- Check API key is correct and not revoked
- For JWT: token may be expired (1-hour lifetime)
- Student may be `suspended` or `inactive`

**403 Forbidden / SCOPE_REQUIRED**
- API key doesn't have required scope
- Student trying to access faculty endpoint
- Check `current_scopes` in error response

**400 ETHICS_REQUIRED**
- Student hasn't passed ethics quiz (≥80% default)
- Check current score: `GET /education-ethics`

**400 CAPACITY_EXCEEDED**
- Student import exceeds `student_capacity` on semester
- Check current count and capacity in error response

**404 Not Found**
- Resource doesn't exist or belongs to different org
- Students can only see their own projects

---

## 22. Code Examples

### JavaScript (fetch)

```javascript
const BASE = 'https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1';
const API_KEY = 'glo_stu_your_key_here';

// Get sandbox cases
const response = await fetch(
  `${BASE}/education-sandbox?type=cases&lang=en&page=1&limit=10`,
  { headers: { 'x-api-key': API_KEY } }
);
const { data, pagination } = await response.json();
console.log(`Page ${pagination.page} of ${pagination.total_pages}`);
```

### Python (requests)

```python
import requests

BASE = "https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1"
headers = {"x-api-key": "glo_stu_your_key_here"}

# Get sandbox cases in Swahili
resp = requests.get(f"{BASE}/education-sandbox", params={
    "type": "cases", "lang": "sw", "page": 1, "limit": 20
}, headers=headers)

data = resp.json()
for case in data["data"]:
    print(f"{case['case_id']}: {case['category']} — {case['status']}")
```

### cURL — Faculty: Batch Grade

```bash
curl -X POST "$BASE_URL/education-projects?action=batch-review" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "reviews": [
      {"project_id": "uuid1", "grade": "A", "status": "reviewed"},
      {"project_id": "uuid2", "grade": "B+", "faculty_comments": "Solid analysis", "status": "reviewed"}
    ]
  }'
```

---

## Appendix: Complete Endpoint Reference

| # | Function | Path | Methods | Auth | Live? |
|---|---|---|---|---|---|
| 1 | education-setup | `/education-setup` | POST | JWT | ✅ |
| 2 | education-students | `/education-students` | GET, POST | JWT | ✅ |
| 3 | education-ethics | `/education-ethics` | GET, POST | API Key / JWT | ✅ |
| 4 | education-assignments | `/education-assignments` | GET, POST | API Key / JWT | ✅ |
| 5 | education-projects | `/education-projects` | GET, POST | API Key / JWT | ✅ |
| 6 | education-sandbox | `/education-sandbox` | GET | API Key / JWT | ✅ |
| 7 | education-analytics | `/education-analytics` | GET | API Key / JWT | ✅ |
| 8 | education-faculty | `/education-faculty` | GET | JWT | ✅ |
| 9 | education-rate-limits | `/education-rate-limits` | GET, POST | JWT | ✅ |
| 10 | education-anonymize | `/education-anonymize` | POST | Internal | ✅ |
| 11 | education-citation | `/education-citation` | GET | Public | ✅ |
| 12 | education-docs | `/education-docs` | GET | Public | ✅ |
| 13 | lti-login | `/lti-login` | POST | LTI | ❌ |
| 14 | lti-launch | `/lti-launch` | POST | LTI | ❌ |
| 15 | lti-jwks | `/lti-jwks` | GET | Public | ❌ |
| 16 | lti-deeplink | `/lti-deeplink` | POST | LTI | ❌ |
| 17 | lti-grade-passback | `/lti-grade-passback` | POST | LTI | ❌ |
