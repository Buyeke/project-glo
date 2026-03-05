# GLO × [University Name] — Moodle LTI Integration Onboarding Brief

**From:** Project GLO Technical Team  
**To:** University IT / LMS Administration Team  
**Date:** 2026-03-05  
**Subject:** Integrating Project GLO's Education API with your Moodle LMS

---

## Hello 👋

We're excited to integrate Project GLO's Education API with your Moodle instance. This integration uses **LTI 1.3** (Learning Tools Interoperability) — the industry standard for connecting external tools to learning management systems. It will enable:

- **Single Sign-On** — Students and faculty access GLO directly from Moodle, no separate accounts needed
- **Auto-Enrollment** — Students are provisioned automatically on first launch
- **Assignment Linking** — Faculty can embed specific GLO assignments as Moodle activities
- **Grade Sync** — Project grades push back to the Moodle gradebook automatically

---

## What We Need From You

To complete the integration, we need your IT team to:

### Step 1: Register GLO as an External Tool in Moodle

Navigate to **Site Administration → Plugins → Activity Modules → External Tool → Manage Tools** and configure with these settings:

| Field | Value |
|---|---|
| Tool name | `Project GLO – Education API` |
| Tool URL | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-launch` |
| LTI version | `LTI 1.3` |
| Public key type | `Keyset URL` |
| Public keyset URL | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-jwks` |
| Initiate login URL | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-login` |
| Redirection URI(s) | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-launch` |
| Content Selection URL | `https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/lti-deeplink` |

Under **Services**, enable:
- ✅ IMS LTI Assignment and Grade Services
- ✅ IMS LTI Names and Role Provisioning Services

Under **Privacy**, set all sharing options to **Always**.

> Full configuration details are in the attached technical specification (Section 3).

### Step 2: Send Us These Three Values

After saving the tool in Moodle, the system will generate:

1. **Client ID** (e.g., `aBcDeFgHiJk`)
2. **Deployment ID** (e.g., `1`)
3. **Platform Issuer URL** (your Moodle URL, e.g., `https://moodle.university.ac.ke`)

📧 Please send these to **tech@projectglo.org**

### Step 3: Confirm Network Access

Ensure your Moodle server can reach these domains over HTTPS:
- `fznhhkxwzqipwfwihwqr.supabase.co`

No firewall changes should be needed unless your institution restricts outbound HTTPS traffic.

---

## What We Handle

On our side, we will:

1. Register your Moodle instance as a trusted platform
2. Configure the LTI launch endpoints
3. Set up auto-provisioning for your students and faculty
4. Enable grade passback to your Moodle gradebook
5. Provision a sandbox environment with synthetic data for your courses

---

## Requirements

| Requirement | Details |
|---|---|
| Moodle Version | 3.10+ required (4.x recommended) |
| Moodle Role | Site Administrator (for tool registration) |
| GLO Account | Education-tier organization (we'll set this up for you) |
| Network | HTTPS required; no special ports needed |

---

## Timeline

| Phase | Duration | Description |
|---|---|---|
| **Configuration** | 1–2 days | You register the tool; send us the credentials |
| **Setup** | 1–2 days | We configure your platform on our side |
| **Testing** | 2–3 days | Joint testing with a pilot course |
| **Go Live** | 1 day | Enable for all enrolled courses |

**Estimated total: 1–2 weeks**

---

## Testing Checklist

Once configured, we'll jointly verify:

| # | Test | Expected Result |
|---|---|---|
| 1 | Student clicks GLO activity (first time) | Redirected to Ethics Quiz |
| 2 | Student passes Ethics Quiz (≥80%) | API key generated, dashboard loads |
| 3 | Returning student clicks GLO activity | Goes directly to dashboard |
| 4 | Instructor clicks GLO activity | Goes to Faculty Portal |
| 5 | Faculty creates assignment | Appears in student portal |
| 6 | Student submits project | Faculty notified |
| 7 | Faculty grades project | Grade appears in Moodle gradebook |
| 8 | Unregistered Moodle instance attempts launch | Gets 403 Forbidden |

---

## Security & Privacy

- All communication uses **TLS 1.2+** (HTTPS only)
- Authentication uses **RS256 JWT signatures** verified against your Moodle's public keys
- Student data is **anonymized** in API responses using HMAC-SHA256
- We comply with **GDPR** and the **Kenya Data Protection Act**
- Student emails and real names are never exposed in sandbox/API data
- Full security details in the attached specification (Section 6)

---

## Data Handling

| Data Point | How We Handle It |
|---|---|
| Student name | Stored securely; anonymized in all API outputs |
| Student email | Stored securely; never exposed to other students |
| Moodle user ID | Used only for identity mapping; not shared |
| Course context | Maps to isolated organization; no cross-course data leakage |
| IP addresses | Logged for rate limiting; rotated after 90 days |

---

## Contacts

| Topic | Contact |
|---|---|
| Integration setup & credentials | tech@projectglo.org |
| Partnership & licensing | partner@projectglo.org |
| Ethics certification questions | ethics@projectglo.org |
| Technical documentation | [Full LTI Specification](docs/MOODLE_LTI_INTEGRATION.md) |

---

## Attached Documents

1. **MOODLE_LTI_INTEGRATION.md** — Full technical specification (endpoints, data mapping, security, testing)
2. **DATABASE_SCHEMA.md** — Database schema reference
3. **TECHNICAL_ARCHITECTURE.md** — Platform architecture overview

---

We look forward to working with your team. Once you've completed Steps 1–3 above, we'll have you up and running within days.

**— Project GLO Technical Team**  
tech@projectglo.org | projectglo.org
