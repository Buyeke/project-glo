

# Improve Chatbot Fallback Logic and Migrate Away from OpenAI

## Overview

This plan addresses the four identified fallback weaknesses and introduces a migration path from OpenAI to Lovable AI (which serves Google Gemini models), eliminating your OpenAI dependency and cost.

---

## Part 1: Fix Current Fallback Issues

### 1A. Remove Authentication Wall for Basic Chat

**Problem:** Unauthenticated visitors hit the local keyword matcher immediately because `useAIChatProcessor` requires a session.

**Fix:** Create a new lightweight edge function `ai-chat-public` that skips JWT verification and uses IP-based rate limiting instead of user-based. The enhanced processor will try the public endpoint when no session exists.

- `useAIChatProcessor.tsx` -- remove the "Authentication required" throw; instead, call `ai-chat-public` for anonymous users and `ai-chat-processor` for logged-in users
- `supabase/functions/ai-chat-public/index.ts` -- new function with IP-based rate limiting, smaller token budget (300 vs 600), and the same system prompt

### 1B. Add Retry for Transient AI Failures

**Problem:** A single OpenAI 503 or timeout immediately drops to keyword matching.

**Fix:** Add a retry wrapper (1 retry with 2-second delay) inside `useEnhancedChatMessageProcessor` before falling back to local processing.

- `useEnhancedChatMessageProcessor.tsx` -- wrap the AI call in a retry helper; only fall back after the retry also fails

### 1C. Use Knowledge Base Results in Fallback

**Problem:** When the AI call fails, the knowledge base results already fetched are discarded.

**Fix:** Pass knowledge results into the local `useChatMessageProcessor` fallback path. If there are relevant knowledge items, include them in the bot response instead of using only the generic cultural response.

- `useChatMessageProcessor.tsx` -- accept an optional `knowledgeContext` parameter; when present and no intent matches, use the top knowledge result as the response body instead of the generic fallback
- `useEnhancedChatMessageProcessor.tsx` -- pass `knowledgeResults` to the fallback call

### 1D. Tell Users When They Get a Degraded Response

**Problem:** Silent fallback with no indicator that the response quality is reduced.

**Fix:** Add a `degraded` flag to bot messages. When displaying a fallback response, show a subtle banner: "I'm using basic matching right now. For better answers, try again in a moment."

- `types/chatbot.ts` -- add optional `degraded?: boolean` field to `ChatMessage`
- `useChatMessageProcessor.tsx` -- set `degraded: true` on fallback messages
- `ChatMessage.tsx` -- render a small info banner when `message.degraded` is true

---

## Part 2: Migrate from OpenAI to Lovable AI

This project already has a `LOVABLE_API_KEY` secret configured. Lovable AI provides Google Gemini models at the same OpenAI-compatible endpoint, so the migration is straightforward.

### 2A. Update `ai-chat-processor` Edge Function

Replace the two OpenAI `fetch` calls with calls to the Lovable AI gateway:

| Current | New |
|---------|-----|
| `https://api.openai.com/v1/chat/completions` | `https://ai.gateway.lovable.dev/v1/chat/completions` |
| `Bearer ${OPENAI_API_KEY}` | `Bearer ${LOVABLE_API_KEY}` |
| `model: 'gpt-4o-mini'` | `model: 'google/gemini-3-flash-preview'` |

Both the response generation call and the classification call get updated. The request/response format is identical (OpenAI-compatible).

Add handling for Lovable AI-specific errors:
- **429** -- rate limit exceeded, surface to user
- **402** -- payment required, surface to user

Update the cost tracking in `ai_model_metrics` to reflect Gemini pricing instead of GPT-4o-mini pricing.

### 2B. Create `ai-chat-public` Edge Function (for anonymous users)

Same as above but:
- No JWT verification
- IP-based rate limiting (stricter: 10 requests/minute vs 30)
- Smaller token budget (`max_tokens: 300`)
- Uses `google/gemini-3-flash-preview`
- Skips the classification second call (saves cost for anonymous users)

### 2C. Update `org-widget-chat` Edge Function

This function also calls OpenAI directly. Update it the same way:
- Replace OpenAI URL with Lovable AI gateway
- Replace `OPENAI_API_KEY` with `LOVABLE_API_KEY`
- Replace `gpt-4o-mini` with `google/gemini-3-flash-preview`

### 2D. Update `config.toml`

Add the new `ai-chat-public` function with `verify_jwt = false`.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ai-chat-processor/index.ts` | Switch from OpenAI to Lovable AI gateway, add 429/402 handling |
| `supabase/functions/ai-chat-public/index.ts` | **New** -- anonymous-friendly AI endpoint with IP rate limiting |
| `supabase/functions/org-widget-chat/index.ts` | Switch from OpenAI to Lovable AI gateway |
| `supabase/config.toml` | Add `ai-chat-public` function entry |
| `src/hooks/useAIChatProcessor.tsx` | Remove auth requirement; route to public endpoint when no session |
| `src/hooks/useEnhancedChatMessageProcessor.tsx` | Add retry logic; pass knowledge context to fallback |
| `src/hooks/useChatMessageProcessor.tsx` | Accept knowledge context; use it in fallback responses |
| `src/types/chatbot.ts` | Add `degraded` field to `ChatMessage` |
| `src/components/chatbot/ChatMessage.tsx` | Render degraded-response banner |

No database changes needed.

---

## Result After Implementation

- Anonymous visitors get AI-powered responses (rate-limited)
- Transient failures retry once before falling back
- Fallback responses include relevant knowledge base content instead of generic templates
- Users see a subtle indicator when getting degraded responses
- All AI calls go through Lovable AI (Gemini) instead of OpenAI -- no more OpenAI dependency or costs

