

# Education API Plan Update - Amendments (v1.2.0-rev1)

Incorporating 5 refinements into the approved Education API plan before implementation begins.

---

## 1. Schema Change: `edu_students` Table

Add two columns to the `edu_students` table definition:

- **`rate_limit_override`** (integer, nullable) -- Faculty can set per-student daily call limits that override the semester default. NULL means "use semester default."
- **`last_active_at`** (timestamptz, nullable) -- Updated on every authenticated API call by the student. Avoids expensive log-table queries for the faculty dashboard's "last active" column.

These columns will be included in the Batch 1 migration alongside the rest of the `edu_students` table creation.

---

## 2. New Action: Suspicious Activity Detection in `education-faculty`

Add a new query action to the existing `education-faculty` edge function:

**`GET ?action=suspicious-activity`**

Returns flagged students based on three heuristics:

- **Shared API key detection** -- Multiple distinct IP addresses using the same student's key within a short window (e.g., 3+ IPs in 1 hour).
- **Unusual query volume** -- Students exceeding 3x the cohort average call rate in a single day.
- **Copy-paste detection** -- Near-identical query sequences between two or more students (Jaccard similarity on recent endpoint+parameter sequences).

Response includes `student_id`, `flag_type`, `severity` (low/medium/high), `details`, and `detected_at`. This will be built in Batch 3 alongside the rest of the faculty function.

---

## 3. Anonymization Enhancement: Consistent Hashing

Update the `education-anonymize` function to use deterministic, session-scoped aliasing:

- Use HMAC-SHA256 with a per-session salt (derived from the student's session ID + a server-side secret) to generate stable mappings.
- Example: "Case-123" always maps to "Case-A" within the same student session. "Hope Center" always maps to "Org-B" within that session.
- A different student or different session gets different mappings (preventing cross-student de-anonymization).
- Implementation: Build a lookup map at the start of each request using `Map<original_value, alias>`, seeded by HMAC. Cache within the request lifecycle.

This will be implemented in Batch 2 with the anonymization function.

---

## 4. Clarification: `education-setup` Semester Behavior

**Decision: Auto-create first semester on setup.**

When `education-setup` is called:
1. Creates/updates the organization with `tier = 'education'`.
2. Automatically creates the first `edu_semesters` record using the provided `semester_start` and `semester_end` dates.
3. Faculty can later create additional semesters via `education-rate-limits` (see item 5 below) or a dedicated semester management action.

This avoids a two-step setup process for new university partners.

---

## 5. New Edge Function: `education-rate-limits`

A standalone faculty endpoint for mid-semester configuration changes, separate from org registration.

**Actions:**

| Method | Action | Description |
|--------|--------|-------------|
| GET | `?action=current` | View current rate limit config for the semester |
| POST | `?action=update-semester` | Change daily limits for normal/assignment/off-semester periods |
| POST | `?action=student-override` | Set `rate_limit_override` for a specific student (writes to `edu_students.rate_limit_override`) |
| POST | `?action=clear-override` | Reset a student back to semester defaults |
| POST | `?action=create-semester` | Create a new semester with its own rate config |
| GET | `?action=list-semesters` | List all semesters for the org |

Requires faculty/owner/admin role. Will be added to the `supabase/config.toml` with `verify_jwt = false` (uses the existing dual-auth pattern).

**Implementation batch:** Batch 1 (Foundation), since rate limits are foundational to all other education endpoints.

---

## Updated Implementation Sequence

**Batch 1 -- Foundation**
- Database migration (all 8 tables, now with `rate_limit_override` and `last_active_at` on `edu_students`)
- `education-setup` (auto-creates first semester)
- `education-students`
- `education-ethics`
- `education-docs`
- `education-rate-limits` (new)
- `supabase/config.toml` updates (12 functions total)

**Batch 2 -- Data Layer**
- `education-sandbox`
- `education-anonymize` (with consistent HMAC-based hashing)
- `education-analytics`
- `education-citation`

**Batch 3 -- Academic Workflow**
- `education-faculty` (with `suspicious-activity` action)
- `education-projects`
- `education-assignments`

---

## Technical Notes

- The `last_active_at` column on `edu_students` will be updated by a shared utility called at the start of every authenticated education endpoint request, keeping writes lightweight (single column update).
- The suspicious activity detection queries `edu_api_usage` for IP and pattern analysis. The `edu_api_usage` table already captures `endpoint`, `method`, and `status_code` per call, which is sufficient for copy-paste similarity detection.
- The `education-rate-limits` function checks rate limits by reading `edu_semesters.settings` and `edu_students.rate_limit_override`, with the student override taking priority when non-null.

