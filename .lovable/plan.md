

# Make Partners Page and Pricing Content Editable via Admin CMS

## What This Does

Right now, all the text and pricing on the Partners page, donation tiers, and employer job listing pricing are hardcoded in the source code. This plan makes all of that editable from the Admin Panel's Content Management tab so you can update prices, descriptions, partner listings, and benefits without touching any code.

## Content That Will Become Editable

### Partners Page
- **Hero section** -- title, subtitle
- **3 partnership type cards** -- title, description (includes pricing), and button labels for each:
  - NGO & Service Providers ($299-$899/month)
  - Corporate Sponsors ($5,000+)
  - Research & Academic ($300/deliverable)
- **Current partners list** -- each partner's name, location, and description
- **Benefits list** -- the 6 "Why Partner With Us" bullet points
- **Contact email** displayed at the bottom

### Donation Tiers (Donate page + DonationForm)
- 4 impact tiers: title, description, USD amount, KSh amount

### Employer Job Listing Price
- The "$30 for 30 days" text shown on Home, EmployerAuth, and JobPostingForm

---

## Technical Approach

### 1. Database: Seed new `site_content` rows

Insert approximately 20 new rows into the existing `site_content` table covering all the editable content above. Each row uses the existing `content_type` values (`text` for simple strings, `stat` for number+label pairs) plus a new type `list` for arrays like benefits and partner cards.

Content keys will follow the pattern:
- `partners_hero_title`, `partners_hero_subtitle`
- `partners_ngo_title`, `partners_ngo_description`, `partners_corporate_title`, etc.
- `partners_benefits` (list type with array of strings)
- `partners_current_partners` (list type with array of {name, location, description})
- `partners_contact_email`
- `donation_tier_1`, `donation_tier_2`, `donation_tier_3`, `donation_tier_4` (each with title, description, amount, ksh)
- `employer_job_price`, `employer_job_duration`

All rows use `section = 'partnerships'` or `section = 'pricing'`.

### 2. ContentManagement.tsx -- Support new content types

Add rendering/editing support for:
- **`list` type** -- Render each item in the list with edit fields; allow adding/removing items
- **`pricing_card` type** -- Structured editor with title, description, price fields
- **`donation_tier` type** -- Editor with title, description, USD amount, KSh amount

Add a new "Pricing" tab to the admin TabsList (expanding from 5 to 6 tabs).

### 3. Partners.tsx -- Read from CMS instead of hardcoded values

Replace the hardcoded `partnershipTypes`, `benefits`, hero text, and partner list with data from `useSiteContent()` / `useContentValue()`, falling back to the current hardcoded values if the CMS data hasn't loaded yet.

### 4. Donate.tsx + DonationForm.tsx -- Read donation tiers from CMS

Replace the hardcoded `impactLevels`/`donationTiers` arrays with CMS-sourced data, with the current values as fallbacks.

### 5. Home.tsx, EmployerAuth.tsx, JobPostingForm.tsx -- Read job price from CMS

Replace the hardcoded "$30 for 30 days" strings with a `useContentValue('employer_job_price', ...)` call.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/new_migration.sql` | Insert ~20 new `site_content` rows |
| `src/components/admin/ContentManagement.tsx` | Add `list`, `pricing_card`, `donation_tier` editors; add "Pricing" tab |
| `src/pages/Partners.tsx` | Replace hardcoded content with `useContentValue()` calls |
| `src/pages/Donate.tsx` | Replace hardcoded tiers with CMS data |
| `src/components/donation/DonationForm.tsx` | Replace hardcoded tiers with CMS data |
| `src/pages/Home.tsx` | Replace hardcoded job price with CMS data |
| `src/components/employer/EmployerAuth.tsx` | Replace hardcoded job price with CMS data |
| `src/components/employer/JobPostingForm.tsx` | Replace hardcoded job price with CMS data |

No new tables or RLS changes needed -- uses the existing `site_content` table and policies.

