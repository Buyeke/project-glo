
# B2B SaaS Positioning Update Plan

## Overview
This plan updates website copy across multiple pages to clarify GLO's positioning as a **B2B SaaS platform** that organizations pay for, while maintaining the end-user service directory experience. The key messaging shift emphasizes:
- Platform subscriptions (not "partnership fees")
- Sheng language capability as the key differentiator
- Clear distinction between organizational users and end-user beneficiaries

---

## Changes by Page

### 1. About Page (`src/pages/About.tsx`)

**Hero Section - Update Opening Paragraph**
- **Current**: "Project GLO is an AI-powered, multilingual data and coordination platform operated by Glomera Operations Ltd. We connect women in Kenya to independent, verified partner organizations providing trauma-informed care."
- **New**: "GLO is an AI-powered crisis response and case management SaaS platform operated by Glomera Operations Ltd. We enable NGOs, government agencies, and social service organizations to deliver trauma-informed support at scale through AI that speaks authentic Sheng, Swahili, and English."

**After Platform Impact Section - Add New Sentence**
- Add below the statistics grid: "Our technology serves two audiences: vulnerable women seeking support, and the organizations coordinating their care."

**All other content remains unchanged**: Mission, Vision, Values, Founder section, Research Focus, Partners, Glomera Operations Ltd info

---

### 2. Resources Page (`src/pages/Resources.tsx` + `src/components/resources/ResourcesHeader.tsx`)

**Add Organization CTA Section (New Component)**
Create a prominent section above the existing content with:
- Title: "For Organizations: Access Platform Tools"
- Content: "Are you an NGO, government agency, or service provider?"
- CTAs: "Access Platform Dashboard" | "Start Free Trial" | "Book a Demo"

**Update ResourcesHeader**
- Add intro text: "Browse educational resources and guides. Organizations: Access full platform documentation in your dashboard."

**Keep Everything Else Unchanged**: All service cards, filtering, and "Request Referral" functionality

---

### 3. Partners Page (`src/pages/Partners.tsx`)

**Update Section Title**
- Change "Partnership Opportunities" to "Platform Access & Partnerships"
- Add subtitle clarifying: "Join the GLO coordination network with platform subscriptions or sponsorship opportunities"

**Update Partnership Type Cards**

| Current | Updated |
|---------|---------|
| NGO & Service Providers: "Join the GLO coordination network. Receive secure referrals from our AI-powered platform. Partnerships from $500/month." | "Join the GLO coordination network. Get platform access to manage referrals, track cases, and measure impact. Platform subscriptions from $299/month (Community tier) to $899/month (Professional tier)." + Add links: "View Full Pricing" and "Start Free Trial" |
| Corporate Sponsors: "Support platform development and infrastructure through sponsorship... From $10,000" | "Fund platform access for partner NGOs or sponsor feature development. Sponsorships from $5,000." + Add link: "Explore CSR Partnerships" |
| Research & Academic | Keep as-is: "From $300 per deliverable" |

**Keep Unchanged**: Current Partners section, Benefits section, Contact Form, Direct Contact

---

### 4. Employer Dashboard (`src/components/employer/EmployerAuth.tsx`)

**Add Clarifying Text Above Portal Title**
- New subheader: "Post dignified work opportunities to help women transition to economic independence. $30 for 30 days."

**Update Description Below "Employer Portal" Title**
- **Current**: "Post jobs and manage your hiring process"
- **New**: "Post jobs and manage your hiring process. Help women in our partner network find sustainable employment. Quick setup, verified candidates, measurable impact."

**Keep Unchanged**: All sign-in/sign-up functionality, forms, authentication flows

---

### 5. Footer Updates (`src/components/Footer.tsx`)

**Add Two Clear CTAs**
Add a new row above the current footer content with prominent CTAs:
- "Start Free Trial" (for Organizations) → links to `/partners`
- "Donate" (Support Platform Development) → links to `/donate`

**Update Project GLO Description**
- Emphasize Sheng capability: "An AI-powered coordination platform with trauma-informed chatbot in Sheng, Swahili, and English—connecting women in Kenya to verified partner organizations."

---

## Technical Implementation Summary

| File | Type of Change |
|------|----------------|
| `src/pages/About.tsx` | Copy updates (2 locations) |
| `src/components/resources/ResourcesHeader.tsx` | Copy update + organization note |
| `src/pages/Resources.tsx` | Add organization CTA section component |
| `src/pages/Partners.tsx` | Copy updates to partnership types and pricing |
| `src/components/employer/EmployerAuth.tsx` | Add clarifying copy (2 locations) |
| `src/components/Footer.tsx` | Add CTA row + update description |

---

## What Will NOT Change

- Any existing forms, buttons, or functionality
- Service cards or filtering systems
- Navigation structure
- Sign-in/authentication flows
- Database interactions
- Any code logic or technical implementation

---

## Key Messaging Principles Applied

1. **Platform Subscription Language**: "Platform subscriptions" instead of "partnership fees"
2. **Sheng Differentiator**: Highlighted wherever AI/chatbot is mentioned
3. **Dual Audience Clarity**: Explicit mention that platform serves both organizations and end-users
4. **Pricing Transparency**: Clear tier structure ($299-$899/month for NGOs, $5,000+ for sponsors)
5. **CTA Visibility**: "Start Free Trial" and "Donate" visible across site

