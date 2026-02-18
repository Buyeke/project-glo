

# User Time Tracking on Admin Dashboard

## Overview

Add a new "Usage" tab to the Admin Dashboard that shows how many hours each user has spent on the platform. Users are displayed with their name, organization type (user_type from profiles), and organization name (from the organizations table if applicable). The system will track actual session time by creating a `user_sessions` table that logs session start/end times.

---

## Part 1: Database -- New `user_sessions` Table

Create a table to track individual user sessions with start and end timestamps, enabling accurate time-on-platform calculations.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users, not null |
| `session_start` | timestamptz | When user started the session |
| `session_end` | timestamptz | Updated when user leaves/goes idle |
| `duration_minutes` | numeric | Computed on session end |
| `device_type` | text | desktop/mobile/tablet |
| `created_at` | timestamptz | Auto |

RLS: Users can insert/update their own sessions. Admins can read all.

---

## Part 2: Client-Side Session Tracking

Update `src/hooks/useDataTracking.tsx` to:

- On mount (when user is authenticated), insert a new `user_sessions` row with `session_start = now()`
- Store the session ID in state
- On `beforeunload` / `visibilitychange` (tab hidden), update the row with `session_end = now()` and computed `duration_minutes`
- Use a heartbeat (every 60 seconds) to update `session_end` so we don't lose data if the browser crashes

---

## Part 3: Admin Dashboard -- New "Usage" Tab

### New Component: `src/components/admin/UserUsageTracker.tsx`

Displays a table with the following columns:
- **User Name** (from `profiles.full_name`)
- **Organization Type** (from `profiles.user_type` -- individual, ngo, etc.)
- **Organization Name** (joined from `organizations.name` via `organization_members`, or "N/A" for individuals)
- **Total Hours** (sum of `duration_minutes` from `user_sessions`, converted to hours)
- **Last Active** (most recent `session_end`)

Features:
- Date range filter (from/to date pickers) to filter sessions
- Sort by total hours or name
- Search/filter by user name or organization type

The component queries `user_sessions` joined with `profiles` and optionally `organization_members` + `organizations` to get org names.

### AdminDashboard Update

- Add a 9th tab "Usage" with a Clock icon
- Render `UserUsageTracker` in that tab
- Update the grid from `grid-cols-8` to `grid-cols-9`

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/new.sql` | Create `user_sessions` table with RLS policies |
| `src/hooks/useDataTracking.tsx` | Add session start/end tracking with heartbeat |
| `src/components/admin/UserUsageTracker.tsx` | **New** -- usage tracking table with filters |
| `src/components/admin/AdminDashboard.tsx` | Add "Usage" tab |

---

## Technical Details

- Session tracking uses `navigator.sendBeacon` on `beforeunload` for reliable end-of-session updates, falling back to a regular Supabase update
- The heartbeat pattern ensures sessions are captured even if the user closes the browser abruptly -- the last heartbeat timestamp serves as a reasonable `session_end`
- The admin query aggregates `SUM(duration_minutes)` grouped by `user_id`, joining `profiles` for name/type and `organization_members` + `organizations` for org name
- Sessions without an `session_end` (active sessions) use `now() - session_start` for real-time display

