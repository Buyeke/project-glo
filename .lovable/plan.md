

# Project GLO Website Copy Rewrite Plan

## Strategic Goal

Reposition Project GLO as a **technology coordination platform** operated by **Glomera Operations Ltd**, not a direct service provider. Clarify that services are delivered by independent, verified partner organizations.

---

## Core Messaging Framework

### Before (Current)
> "Connecting vulnerable women in Kenya to housing support, legal aid, mental health services, and dignified work opportunities."

### After (New)
> "An AI-powered, multilingual platform that connects women in Kenya to verified partner organizations providing shelter, legal aid, counseling, and employment support."

### Legal Line (Add to Footer + About)
> "Project GLO is operated by Glomera Operations Ltd, a Kenya-registered social impact technology company."

---

## Files to Update

### 1. Footer (`src/components/Footer.tsx`)

| Current | New |
|---------|-----|
| "Connecting vulnerable women in Kenya to housing support, legal aid, mental health services, and dignified work opportunities." | "A multilingual technology platform connecting women to verified support organizations across Kenya." |
| © 2024 Project GLO. All rights reserved. | © 2025 Glomera Operations Ltd. All rights reserved. Project GLO is operated by Glomera Operations Ltd, a Kenya-registered social impact technology company. |
| Remove prominent "Donate Now" CTA button | Keep subtle donate link in "Support" section only |

---

### 2. Mobile Hero (`src/components/home/MobileHero.tsx`)

| Current | New |
|---------|-----|
| "AI-Powered Support for Vulnerable Women in Kenya" | "AI-Powered Platform for Women in Kenya" |
| "Chat in English, Swahili, or Sheng to connect with trauma-informed care anytime." | "Chat in English, Swahili, or Sheng to find verified support organizations." |
| "Find safe shelter, legal aid, jobs, or counseling" | "Get matched with organizations offering shelter, legal aid, jobs, or counseling" |
| "I Want to Donate" | "Support Our Work" (de-emphasize donation language) |

---

### 3. Visitor Path Selector (`src/components/home/VisitorPathSelector.tsx`)

| Current | New |
|---------|-----|
| "Find safe shelter, legal aid, jobs, or counseling" | "Get matched with organizations offering shelter, legal aid, jobs, or counseling" |
| "Support vulnerable women with a donation" | "Help sustain the platform and its mission" |
| "I want to fund impact" | "Support the platform" |

---

### 4. How It Works Steps (`src/components/home/HowItWorksSteps.tsx`)

| Current | New |
|---------|-----|
| "Get matched to services" | "Get matched to partner organizations" |
| "We connect you with verified organizations that can help" | "Our platform connects you with verified, independent organizations" |
| "A real organization follows up" | "A partner organization follows up" |
| "Receive a personalized response within 24 hours" | "A trained support worker from a partner organization will reach out" |

---

### 5. How GLO Works Modal (`src/components/home/HowGLOWorksModal.tsx`)

| Current | New |
|---------|-----|
| "Based on your needs, we connect you with verified organizations—shelters, legal aid, counseling, and employment support." | "Based on your needs, our platform matches you with independent, verified organizations that provide shelter, legal aid, counseling, and employment support." |
| "a trained support worker from one of our partner organizations will reach out to help you directly" | "a trained support worker from an independent partner organization will contact you directly" |
| "Ongoing case management" | "Coordinated follow-up" |

---

### 6. Features/Benefits (`src/components/home/FeaturesBenefits.tsx`)

| Current | New |
|---------|-----|
| "How We Support You" | "How the Platform Works" |
| "We connect you with the right support based on your needs and location." | "The platform matches you with verified partner organizations based on your needs and location." |
| "AI support anytime with human follow-up during service hours." | "AI-guided matching anytime. Partner organizations follow up during service hours." |
| "only accessible by approved support staff" | "only shared with approved partner organizations" |

---

### 7. Social Proof Bar (`src/components/home/SocialProofBar.tsx`)

| Current | New |
|---------|-----|
| "Vulnerable Women Supported" | "Women Connected to Services" |

---

### 8. Home Page (`src/pages/Home.tsx`)

| Section | Current | New |
|---------|---------|-----|
| Quiz Section | "We'll guide you to the right support" | "We'll match you with verified partner organizations" |
| Quiz Section | "Get matched with services" | "Get matched to partner organizations" |
| Employer Section | "Post social impact jobs that support vulnerable women" | "Post dignified work opportunities through our partner network" |
| Donation Section | "Every contribution helps women access safety, stability, and opportunity" | "Your contribution helps sustain the platform and its coordination network" |
| Donation Section | "goes directly to supporting vulnerable communities" | "helps maintain secure referral infrastructure and partner coordination" |
| Final CTA | "AI support is available anytime with human follow-up" | "AI-powered matching anytime. Partner organizations provide follow-up support." |

---

### 9. About Page (`src/pages/About.tsx`)

**Complete positioning overhaul:**

| Section | Current | New |
|---------|---------|-----|
| Hero Subtitle | "An AI-powered platform connecting vulnerable women in Kenya to trauma-informed care and support services through inclusive, ethical technology." | "Project GLO is an AI-powered, multilingual data and coordination platform operated by Glomera Operations Ltd. We connect women in Kenya to independent, verified partner organizations providing trauma-informed care." |
| Mission | "connect vulnerable women to trauma-informed support services" | "build secure technology infrastructure that connects women to independent, verified organizations providing trauma-informed support" |
| Vision | "AI serves everyone, especially the most vulnerable" | "Technology infrastructure enables dignified access to support services" |
| Impact Section | "Supporting vulnerable communities through technology and care" | "Building coordination infrastructure for partner-delivered services" |
| Values | "ensuring safety, trustworthiness, and cultural humility in all our services" | "ensuring safety, trustworthiness, and cultural humility across our coordination platform" |
| Add legal section | N/A | New section: "About Glomera Operations Ltd" with registration details |
| CTA | "Join Our Mission" | "Work With Us" |
| CTA | "explore our work" / "contribute to our work" | "explore the platform" / "collaborate with us" |

---

### 10. Services Page (`src/pages/Services.tsx`)

**Major positioning shift:**

| Element | Current | New |
|---------|---------|-----|
| Page Title | "Available Services" | "Partner Service Directory" |
| Page Description | "Discover the support services available to help you on your journey. Book sessions or request assistance directly." | "Browse services offered by verified partner organizations. Project GLO coordinates secure referrals—services are delivered by independent providers." |
| Trust/Location Info | "Serving communities with both in-person and virtual consultations" | "Partner organizations serve communities through in-person and virtual consultations" |
| Trust/Location Info | "Once your request is confirmed, we'll send you a personalized virtual meeting link" | "Once your request is confirmed, the partner organization will send you a personalized meeting link" |
| Button | "Book Session" | "Request Referral" |
| Button | "Need Custom Support? Contact Us" | "Can't find what you need? Request coordination" |
| Add disclaimer | N/A | "Services listed are provided by independent, verified partner organizations. Project GLO facilitates coordination and referrals only." |

---

### 11. Partners Page (`src/pages/Partners.tsx`)

| Element | Current | New |
|---------|---------|-----|
| Hero Subtitle | "Join Project GLO in our mission to support vulnerable women in Kenya through technology, care, and community partnerships." | "Join the GLO coordination network operated by Glomera Operations Ltd. Partner with us to reach women across Kenya through secure, dignified referrals." |
| NGO Card | "Join our network to help vulnerable women access your services" | "Join the GLO coordination network. Receive secure referrals from our AI-powered platform." |
| Corporate Card | "Support our mission through funding, resources, or employee engagement programs" | "Support platform development and infrastructure through sponsorship or employee engagement." |

---

### 12. Donate Page (`src/pages/Donate.tsx`)

**De-emphasize donation-led language:**

| Element | Current | New |
|---------|---------|-----|
| Hero Title | "Donate Now – Every Contribution Matters" | "Support the Platform" |
| Hero Subtitle | "Your donation directly supports vulnerable women and their families, providing pathways to stability, safety, and opportunity." | "Your contribution helps sustain the technology infrastructure connecting women to verified partner organizations." |
| Impact Tiers Header | "Your Impact at Every Level" | "How Contributions Are Allocated" |
| Form Title | "Choose Your Donation Amount" | "Choose Contribution Amount" |
| Form Description | "100% of your donation goes directly to supporting vulnerable communities" | "Contributions support platform operations, partner coordination, and infrastructure maintenance" |

---

### 13. Trust Badge (`src/components/ui/TrustBadge.tsx`)

| Current | New |
|---------|-----|
| "only shared with support organizations" | "only shared with verified partner organizations" |
| "Confidential and only shared with support organizations." | "Confidential and shared only with verified, independent partner organizations for service coordination." |

---

### 14. Resources Header (`src/components/resources/ResourcesHeader.tsx`)

| Current | New |
|---------|-----|
| "Find comprehensive support services, legal aid, healthcare, education, and more through our verified partner network." | "Browse resources and service information from verified partner organizations. Project GLO provides coordination—services are delivered by independent providers." |

---

### 15. Contact Page (`src/pages/Contact.tsx`)

| Element | Current | New |
|---------|---------|-----|
| Subtitle | "We're here to help. Reach out to us for support, questions, or to learn more about our services." | "Reach out to the Glomera Operations Ltd team with questions about the platform, partnerships, or how coordination works." |

---

## Summary of Key Changes

### Language Shifts

| Old Pattern | New Pattern |
|-------------|-------------|
| "We provide/offer/deliver..." | "Partner organizations provide..." |
| "Our services" | "Services from partner organizations" |
| "Support services" | "Partner-delivered services" |
| "Get support" | "Get connected to support" |
| "Book session" | "Request referral" |
| "Donate" (prominent) | "Support the platform" (secondary) |
| "Project GLO helps you..." | "The GLO platform connects you to..." |

### New Legal/Brand Elements

- Add "Glomera Operations Ltd" reference in Footer
- Add About section for operating company
- Add service disclaimers on Services page
- Update copyright to reference Glomera Operations Ltd

### Tone Calibration

- **For support seekers:** Maintain warm, survivor-centered, trauma-informed language. Clarify that GLO coordinates, partners deliver.
- **For partners/funders:** Elevate institutional credibility. Position as technology infrastructure, not charity.
- **Overall:** Professional, calm, credible, infrastructure-focused. Avoid charity/hotline/emergency framing except where strictly necessary (e.g., Crisis Support card on Contact page).

---

## Technical Implementation

All changes are copy updates within existing components. No new components or structural changes required.

**Files to modify (17 total):**

1. `src/components/Footer.tsx`
2. `src/components/home/MobileHero.tsx`
3. `src/components/home/VisitorPathSelector.tsx`
4. `src/components/home/HowItWorksSteps.tsx`
5. `src/components/home/HowGLOWorksModal.tsx`
6. `src/components/home/FeaturesBenefits.tsx`
7. `src/components/home/SocialProofBar.tsx`
8. `src/pages/Home.tsx`
9. `src/pages/About.tsx`
10. `src/pages/Services.tsx`
11. `src/pages/Partners.tsx`
12. `src/pages/Donate.tsx`
13. `src/pages/Contact.tsx`
14. `src/components/ui/TrustBadge.tsx`
15. `src/components/resources/ResourcesHeader.tsx`
16. `src/components/donation/DonationForm.tsx` (if donation language exists there)
17. `src/components/donation/DonationImpactStory.tsx` (check for direct service language)

