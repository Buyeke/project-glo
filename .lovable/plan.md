
# Remove Emojis from Chatbot, Add Emergency Contacts with Links

## Overview

Three changes: (1) strip all emoji characters from chatbot responses and UI, (2) add actual emergency contact links/numbers in chat responses, and (3) add an admin-editable Emergency Contacts section to the Resources page.

---

## 1. Remove Emojis from Chatbot

Emojis appear in multiple places across the chatbot codebase. All will be removed:

### Files and specific emoji locations:

**`supabase/functions/ai-chat-processor/index.ts`**
- Line 160: Remove emojis from system prompt ending (`🙏🏽💜`)
- Add instruction to system prompt: "Do NOT use emoji characters in your responses."

**`supabase/functions/ai-chat-public/index.ts`**
- Line 95: Remove emojis from system prompt (`🙏🏽💜`)
- Add same "no emoji" instruction

**`supabase/functions/org-widget-chat/index.ts`**
- No emojis in system prompt currently, but add "no emoji" instruction for consistency

**`src/hooks/useEnhancedChatMessageProcessor.tsx`**
- Line 85: Remove `📚` from "Additional Information" prefix
- Line 102: Remove `🔹` from service title prefix
- Line 106: Remove `📞` from phone prefix
- Line 107: Remove `🌐` from URL prefix
- Line 113: Remove `🚨` emojis from urgent support text
- Line 115: Remove `⚠️` emojis from priority support text
- Line 119: Remove `👥` from human counselor text

**`src/hooks/useChatMessageProcessor.tsx`**
- Line 84: Remove `🔹` from service response
- Line 89: Remove `📞` from call text
- Line 94: Remove `🌐` from more info text
- Line 111-114: Remove `🚨` and `⚠️` from urgency indicators
- Line 137: Remove `📚` from knowledge base response
- Lines 196-202: Remove `💜` from trauma encouragement strings
- Lines 207-213: Remove `🛡️` from safety note strings
- Lines 228-235: Remove `💪🏽` from support note strings

**`src/components/chatbot/ChatQuickActions.tsx`**
- Line 141: Remove `💜` from the bottom safety message

**`src/components/chatbot/ChatMessage.tsx`**
- Line 152: Remove `💜` from "Thanks for your feedback!" text

---

## 2. Add Emergency Contact Links in Chat

Replace the hardcoded placeholder contacts in `emergencyDetection.ts` with real Kenya emergency numbers, and surface them in chat responses.

**`src/utils/emergencyDetection.ts`**
- Update `getEmergencyServices()` to return real contacts:
  - Kenya Police: 999 / 112
  - Childline Kenya: 116
  - GBV Hotline (Healthcare Assistance Kenya): 1195
  - Gender Violence Recovery Centre (GVRC): 0709 319 000
  - FIDA Kenya (legal aid): 0722 509 760

**`src/hooks/useEnhancedChatMessageProcessor.tsx`**
- When `analysis.urgency === 'critical'` or `analysis.safety_concerns === true`, append emergency contacts from `getEmergencyServices()` to the bot response with clickable `tel:` links formatted as text

**`src/hooks/useChatMessageProcessor.tsx`**
- In the `getSafetyNote()` helper, replace hardcoded "call 999 or 112" with the full emergency contact list from `getEmergencyServices()`
- For critical/high urgency responses, append emergency contacts

**`supabase/functions/ai-chat-processor/index.ts`**
- Add emergency contacts to the system prompt so the AI model can reference them directly when responding to crisis messages

---

## 3. Emergency Contacts Section on Resources Page (Admin-Editable)

### Database: New `site_content` rows

Insert seed data into `site_content` with:
- `content_key`: `emergency_contacts`
- `content_type`: `list`
- `section`: `resources`
- `content_value`: JSON array of objects, each with `organization`, `phone`, `locations_served` fields

Default seed data:
| Organization | Phone | Locations Served |
|---|---|---|
| Kenya Police | 999 / 112 | Nationwide |
| Childline Kenya | 116 | Nationwide |
| Healthcare Assistance Kenya (GBV) | 1195 | Nationwide |
| Gender Violence Recovery Centre (GVRC) | 0709 319 000 | Nairobi |
| FIDA Kenya (Legal Aid) | 0722 509 760 | Nationwide |

### New Component: `src/components/resources/EmergencyContacts.tsx`

A prominently styled section at the top of the Resources page (below header, above filters) displaying a table/card grid of emergency contacts. Each row shows:
- Organization name
- Phone number (clickable `tel:` link)
- Locations served

Data sourced from `useContentValue('emergency_contacts', [...defaults])`.

### Resources Page Update: `src/pages/Resources.tsx`

Import and render `EmergencyContacts` between `ResourcesHeader` and `OrganizationCTA`.

### Admin CMS: `src/components/admin/ContentManagement.tsx`

The existing `list` type editor already supports editing arrays. The emergency contacts will appear under the "Resources" section (or a new tab if needed). Each list item will have fields for `organization`, `phone`, and `locations_served`.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ai-chat-processor/index.ts` | Remove emojis from prompt; add "no emoji" rule; add emergency contacts to prompt |
| `supabase/functions/ai-chat-public/index.ts` | Remove emojis; add "no emoji" rule |
| `src/hooks/useEnhancedChatMessageProcessor.tsx` | Remove all emojis; append emergency contacts for critical situations |
| `src/hooks/useChatMessageProcessor.tsx` | Remove all emojis; update safety notes with real contacts |
| `src/utils/emergencyDetection.ts` | Replace placeholder contacts with real Kenya emergency numbers |
| `src/components/chatbot/ChatQuickActions.tsx` | Remove emoji from safety message |
| `src/components/chatbot/ChatMessage.tsx` | Remove emoji from feedback text |
| `src/components/resources/EmergencyContacts.tsx` | **New** -- emergency contacts display component |
| `src/pages/Resources.tsx` | Add EmergencyContacts section |
| `supabase/migrations/new_migration.sql` | Insert emergency_contacts seed data into site_content |
| `src/components/admin/ContentManagement.tsx` | Ensure list editor renders `organization`/`phone`/`locations_served` fields for emergency contacts |
