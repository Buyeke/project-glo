# GLO Education API — Moodle LTI 1.3 Integration Specification

**Version:** 1.0.0  
**Date:** 2026-03-05  
**Audience:** University IT administrators, Moodle admins, LMS integration teams  

---

## 1. Overview

Project GLO's Education API integrates with Moodle via **LTI 1.3 (Learning Tools Interoperability)** to provide:

- **Single Sign-On (SSO):** Students and faculty access GLO directly from Moodle without separate credentials.
- **Auto-Enrollment:** Students are automatically provisioned in GLO when they first launch the tool.
- **Assignment Deep Linking:** Faculty can embed specific GLO assignments as Moodle activities.
- **Grade Passback:** Project grades sync back to the Moodle gradebook via LTI Assignment and Grade Services (AGS).
- **Ethics Certification Gate:** Students must pass an 80% ethics quiz before receiving API access.

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     MOODLE LMS                          │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Course   │  │   External   │  │    Gradebook     │  │
│  │  Activity │──│   Tool (LTI) │  │   (AGS scores)   │  │
│  └──────────┘  └──────┬───────┘  └────────▲─────────┘  │
│                       │                    │            │
└───────────────────────┼────────────────────┼────────────┘
                        │ LTI 1.3 Launch     │ Grade Passback
                        │ (signed JWT)       │ (LTI AGS)
                        ▼                    │
┌───────────────────────────────────────────────────────────┐
│                   GLO PLATFORM                            │
│                                                           │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  lti-launch    │  │  lti-deeplink │  │ lti-grade    │  │
│  │  (Edge Fn)     │  │  (Edge Fn)    │  │ (Edge Fn)    │  │
│  └───────┬────────┘  └──────────────┘  └──────────────┘  │
│          │                                                │
│  ┌───────▼─────────────────────────────────────────────┐  │
│  │              Education API Layer                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐           │  │
│  │  │ Students │ │Assignments│ │  Projects │           │  │
│  │  │ (auto-   │ │ (deep-   │ │  (graded) │           │  │
│  │  │ enrolled)│ │  linked) │ │           │           │  │
│  │  └──────────┘ └──────────┘ └───────────┘           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Supabase (PostgreSQL + Edge Functions)       │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

| Requirement | Details |
|---|---|
| Moodle Version | 3.10+ (LTI 1.3 support required; 4.x recommended) |
| Moodle Role | Site Administrator (for tool registration) |
| GLO Account | Education-tier organization (contact partner@projectglo.org) |
| Network | HTTPS required; GLO endpoints must be reachable from Moodle server |

---

## 3. Moodle Configuration

### 3.1 Register GLO as an External Tool

1. Navigate to: **Site Administration → Plugins → Activity Modules → External Tool → Manage Tools**
2. Click **"Configure a tool manually"**
3. Enter the following settings:

| Field | Value |
|---|---|
| **Tool name** | `Project GLO – Education API` |
| **Tool URL** | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-launch` |
| **LTI version** | `LTI 1.3` |
| **Public key type** | `Keyset URL` |
| **Public keyset URL** | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-jwks` |
| **Initiate login URL** | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-login` |
| **Redirection URI(s)** | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-launch` |
| **Content Selection URL** | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-deeplink` |
| **Tool configuration usage** | `Show in activity chooser and as a preconfigured tool` |

4. Under **Services**:
   - **IMS LTI Assignment and Grade Services:** `Use this service for grade sync and column management`
   - **IMS LTI Names and Role Provisioning Services:** `Use this service to retrieve members' information as per privacy settings`

5. Under **Privacy**:
   - **Share launcher's name with tool:** `Always`
   - **Share launcher's email with tool:** `Always`
   - **Accept grades from the tool:** `Always`

6. Click **Save changes**

7. After saving, Moodle will generate:
   - **Client ID** (e.g., `aBcDeFgHiJk`)
   - **Deployment ID** (e.g., `1`)
   - **Platform ID / Issuer** (your Moodle URL, e.g., `https://moodle.university.ac.ke`)

> ⚠️ **Send these three values to your GLO contact** — they are needed to complete the registration on the GLO side.

### 3.2 Add GLO to a Course

1. Open a course → **Turn editing on**
2. Click **"Add an activity or resource"** in any section
3. Select **"External Tool"** → choose **"Project GLO – Education API"**
4. Configure:
   - **Activity name:** e.g., `GLO API Lab 1 – Trauma-Informed Data Analysis`
   - **Preconfigured tool:** `Project GLO – Education API`
   - **Launch container:** `New window` (recommended) or `Embed`
5. Click **Save and display**

Students will now see the activity in their course and can click to launch GLO.

---

## 4. LTI 1.3 Endpoints (GLO Side)

### 4.1 OIDC Login Initiation

```
POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-login
```

Moodle sends the initial OIDC login request here. GLO validates the `iss`, `login_hint`, and `target_link_uri`, then redirects back to Moodle's authentication endpoint.

**Parameters received from Moodle:**

| Parameter | Description |
|---|---|
| `iss` | Moodle platform issuer URL |
| `login_hint` | Opaque user identifier |
| `target_link_uri` | Where to redirect after auth |
| `lti_message_hint` | Context hint from Moodle |
| `client_id` | Registered client ID |
| `lti_deployment_id` | Deployment identifier |

### 4.2 Launch (Resource Link)

```
POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-launch
```

Receives the signed `id_token` JWT from Moodle after OIDC flow. GLO:

1. Validates the JWT signature against Moodle's JWKS
2. Extracts user identity (`sub`, `name`, `email`)
3. Extracts course context (`context.id`, `context.title`)
4. Determines role (`Instructor` → faculty, `Learner` → student)
5. Auto-provisions: creates org (from course), semester, and student record if first launch
6. Redirects to the appropriate portal:
   - Faculty → `/partner-portal`
   - Student → `/student-portal`

**Key LTI claims processed:**

| Claim | Used For |
|---|---|
| `sub` | Unique user identifier (mapped to `edu_students.student_id_external`) |
| `name` | Student/faculty display name |
| `email` | Student email |
| `https://purl.imsglobal.org/spec/lti/claim/roles` | Role determination |
| `https://purl.imsglobal.org/spec/lti/claim/context` | Course → Organization mapping |
| `https://purl.imsglobal.org/spec/lti/claim/resource_link` | Assignment deep link ID |
| `https://purl.imsglobal.org/spec/lti-ags/claim/endpoint` | Grade passback URL |

### 4.3 Deep Linking (Content Selection)

```
POST https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-deeplink
```

When a faculty member adds GLO as an activity, this endpoint presents a UI to select which GLO assignment to embed. Returns an LTI Deep Linking Response with the selected `resource_link`.

### 4.4 JWKS (Public Key Set)

```
GET https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-jwks
```

Returns GLO's public RSA keys in JWKS format. Moodle uses these to verify signed messages from GLO (e.g., deep linking responses, grade passback JWTs).

**Response format:**

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "glo-edu-2026",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

### 4.5 Grade Passback

GLO pushes grades to Moodle's gradebook using the **LTI Assignment and Grade Services (AGS) 2.0** specification.

**When grades are pushed:**
- When faculty reviews a project and assigns a grade in GLO
- Automatic score update when a project is submitted (completion score)

**Score format:**

```json
{
  "userId": "<moodle-sub-claim>",
  "scoreGiven": 85,
  "scoreMaximum": 100,
  "activityProgress": "Completed",
  "gradingProgress": "FullyGraded",
  "timestamp": "2026-03-05T12:00:00Z"
}
```

---

## 5. Data Mapping

### 5.1 Moodle → GLO Entity Mapping

| Moodle Concept | GLO Entity | Table |
|---|---|---|
| Site/Instance | Platform registration | `lti_platforms` (new) |
| Course | Organization | `organizations` |
| Course Section/Term | Semester | `edu_semesters` |
| Student enrollment | Student record | `edu_students` |
| Instructor | Faculty/org member | `organization_members` |
| Assignment | Assignment | `edu_assignments` |
| Submission | Project | `edu_projects` |
| Grade | Project grade | `edu_projects.grade` |

### 5.2 User Provisioning Flow

```
First LTI Launch (Student)
    │
    ├── Check if edu_student exists (by student_id_external = LTI sub)
    │     ├── YES → Update last_active_at, proceed to portal
    │     └── NO  → Auto-create:
    │               1. Organization (from course context, if new)
    │               2. Semester (current term, if new)
    │               3. edu_student record
    │               4. Redirect to Ethics Quiz (mandatory before API access)
    │
    └── Student Portal loads with org/semester context
```

### 5.3 Role Mapping

| Moodle LTI Role URI | GLO Role |
|---|---|
| `http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor` | `faculty` (organization_members) |
| `http://purl.imsglobal.org/vocab/lis/v2/membership#Learner` | `student` (edu_students) |
| `http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator` | `admin` (organization_members) |
| `http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper` | `faculty` (organization_members) |
| `http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor` | `faculty` (organization_members) |

---

## 6. Security & Privacy

### 6.1 Authentication Flow

```
Student clicks activity in Moodle
    │
    ▼
Moodle sends OIDC login request to GLO (lti-login)
    │
    ▼
GLO validates issuer + client_id, redirects to Moodle auth endpoint
    │
    ▼
Moodle authenticates user, sends signed JWT (id_token) to GLO (lti-launch)
    │
    ▼
GLO validates JWT signature against Moodle's JWKS
    │
    ▼
GLO creates session, redirects to Student/Faculty Portal
```

### 6.2 Security Measures

| Measure | Implementation |
|---|---|
| **JWT Validation** | RS256 signature verified against Moodle's public JWKS |
| **Nonce Replay Prevention** | Each launch nonce is stored and checked for reuse (10-minute window) |
| **State Parameter** | OIDC state validated to prevent CSRF |
| **HTTPS Only** | All endpoints require TLS 1.2+ |
| **Token Expiry** | Launch tokens valid for 5 minutes max |
| **Platform Registration** | Only pre-registered Moodle instances (by issuer URL + client_id) are accepted |

### 6.3 Data Privacy (GDPR/Kenya DPA Compliance)

| Data Point | Handling |
|---|---|
| Student name | Stored in `edu_students.name`; anonymized in API responses via HMAC-SHA256 |
| Student email | Stored in `edu_students.email`; never exposed in sandbox/API responses |
| Moodle user ID (`sub`) | Stored as `edu_students.student_id_external`; used only for identity mapping |
| Course context | Maps to organization; no raw Moodle IDs exposed to other students |
| IP addresses | Logged in `edu_api_usage` for rate limiting; rotated after 90 days |

**Anonymization:** When students use the GLO API for assignments, all case data is automatically anonymized. Sensitive fields (names, locations, identifiers) are replaced with stable HMAC-SHA256 aliases (e.g., `Case-A`, `Location-3`) that are consistent within a session but not reversible.

---

## 7. Rate Limits

GLO applies tiered rate limits per student:

| Context | Requests/Day | Notes |
|---|---|---|
| Normal usage | 100 | Default for enrolled students |
| Active assignment | 500 | Auto-elevated when an assignment is active |
| Off-semester | 0 | API access disabled between semesters |
| Faculty override | Custom | Faculty can set per-student overrides |

Rate limits are enforced per API key and reset daily at midnight UTC.

---

## 8. Testing the Integration

### 8.1 Moodle Test Checklist

| # | Test | Expected Result |
|---|---|---|
| 1 | Click GLO activity as **student** (first time) | Redirected to Ethics Quiz in GLO Student Portal |
| 2 | Complete Ethics Quiz (score ≥ 80%) | API key generated; student sees dashboard |
| 3 | Click GLO activity as **student** (returning) | Goes directly to Student Portal dashboard |
| 4 | Click GLO activity as **instructor** | Goes to Partner Portal with course org context |
| 5 | Faculty creates assignment in GLO | Assignment appears in student's portal |
| 6 | Student submits project in GLO | Submission recorded; faculty notified |
| 7 | Faculty grades project in GLO | Grade appears in Moodle gradebook |
| 8 | Student accesses API with key | Receives anonymized sandbox data |
| 9 | Student exceeds rate limit | Gets 429 response with reset time |
| 10 | Access from unregistered Moodle instance | Gets 403 Forbidden |

### 8.2 Sandbox Mode

GLO provides a synthetic data sandbox that generates realistic but fictional case data in three languages (English, Swahili, Sheng). This data:
- Is refreshed periodically and never contains real PII
- Supports all API endpoints students would use in assignments
- Is isolated per organization (university)

**Sandbox API base URL:**
```
https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/education-sandbox
```

---

## 9. Support & Contact

| Topic | Contact |
|---|---|
| Integration setup | partner@projectglo.org |
| Technical issues | tech@projectglo.org |
| Documentation | [GLO Education API Docs](https://project-glo.lovable.app/partner-portal) |
| Ethics certification questions | ethics@projectglo.org |

---

## 10. FAQ

**Q: Do students need a separate GLO account?**  
A: No. Students are auto-provisioned on first LTI launch using their Moodle identity. No separate registration required.

**Q: What if a student fails the Ethics Quiz?**  
A: They can retake it immediately. API access is only granted after achieving ≥ 80%. Quiz attempts are logged.

**Q: Can we use GLO with multiple courses?**  
A: Yes. Each Moodle course maps to a separate GLO organization with isolated data and student rosters.

**Q: What happens between semesters?**  
A: API access is suspended (rate limit = 0). Faculty can configure new semesters in the Partner Portal or via the next course's first launch.

**Q: Is the data real?**  
A: No. Students work exclusively with synthetic, AI-generated case data. Real GLO platform data is never exposed to the Education API.

**Q: Does this work with Moodle Mobile?**  
A: Yes. LTI launches work in Moodle's mobile app via the built-in browser. The GLO Student Portal is fully responsive.

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-05  
**Classification:** Technical — External Distribution OK
