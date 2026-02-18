

# Partner Onboarding and Invoice Management in Admin Dashboard

## Overview

Add a new "Partners" tab to the Admin Dashboard where you can:
1. Onboard new partners (create organization records with contact details, tier, etc.)
2. View and manage existing partners
3. Create invoices for partners with a month/year billing period selector (e.g., "Jan 2026")

---

## Part 1: Database -- New `partner_invoices` Table

Create a new table to store invoices linked to organizations:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to `organizations` |
| `invoice_number` | text | Auto-generated (e.g., INV-2026-001) |
| `billing_period_month` | integer | 1-12 |
| `billing_period_year` | integer | e.g., 2026 |
| `amount` | numeric | Invoice amount |
| `currency` | text | Default 'USD' |
| `description` | text | Line item description |
| `status` | text | draft / sent / paid / overdue / cancelled |
| `due_date` | date | Payment due date |
| `paid_at` | timestamptz | When payment was received |
| `notes` | text | Admin notes |
| `created_by` | uuid | Admin who created it |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

RLS: Admin-only access for all operations.

---

## Part 2: Admin Dashboard -- New "Partners" Tab

### 2A. Add Tab to AdminDashboard

Add a "Partners" tab (8th tab) to `AdminDashboard.tsx` that renders a new `PartnerManagement` component.

### 2B. Create `PartnerManagement.tsx`

This component has two sub-views:

**Partners List View:**
- Table showing all organizations: name, contact email, tier, status (active/inactive), created date
- "Add Partner" button opens an onboarding form
- Click a partner row to view details and invoices

**Partner Onboarding Form (dialog/modal):**
- Fields: Organization Name, Slug (auto-generated from name), Contact Email, Contact Phone, Website, Description, Tier (dropdown: community / professional / enterprise), Notes
- On submit: inserts into `organizations` table with `owner_user_id` set to the admin's ID (can be reassigned later)

**Invoice Section (per partner):**
- "Create Invoice" button opens invoice form
- Invoice form fields:
  - Billing Period: two dropdowns -- Month (January-December) and Year (2024-2030)
  - Amount (numeric input)
  - Currency (USD default, dropdown)
  - Description (text)
  - Due Date (date picker)
  - Notes (optional textarea)
- Invoice list for the selected partner showing: invoice number, billing period, amount, status, due date
- Status can be updated inline (draft -> sent -> paid)

---

## Part 3: Quick Action on Overview

Add a "Manage Partners" quick action button on the overview tab that navigates to the partners tab.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/new.sql` | Create `partner_invoices` table with RLS |
| `src/components/admin/PartnerManagement.tsx` | **New** -- Partner list, onboarding form, invoice CRUD |
| `src/components/admin/AdminDashboard.tsx` | Add "Partners" tab, quick action button |

---

## Technical Notes

- The `organizations` table already has the fields needed for partner data (name, slug, contact_email, tier, etc.), so no schema changes needed there
- Invoice numbers will be generated client-side as `INV-{YEAR}-{sequential}` based on existing invoice count
- The billing period selector uses two `<Select>` dropdowns -- one for month name, one for year -- storing as integers in the database for easy querying
- All operations are admin-only, enforced by RLS policies on `partner_invoices` and existing policies on `organizations`

