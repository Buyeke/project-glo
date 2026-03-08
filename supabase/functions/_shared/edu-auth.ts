import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

export interface EduAuthContext {
  orgId: string
  org: { id: string; tier: string; settings: unknown }
  role: string
  userId: string | null
  studentId: string | null
  scopes: string[]
  adminClient: ReturnType<typeof createClient>
}

// Error codes for structured error responses
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SCOPE_REQUIRED: 'SCOPE_REQUIRED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE: 'DUPLICATE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  ETHICS_REQUIRED: 'ETHICS_REQUIRED',
} as const

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return new Response(JSON.stringify({ error: message, code, ...details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function jsonResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  })
}

// Pagination helper
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export function parsePagination(url: URL, defaultLimit = 50, maxLimit = 200): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(maxLimit, Math.max(1, parseInt(url.searchParams.get('limit') || String(defaultLimit))))
  return { page, limit, offset: (page - 1) * limit }
}

export function paginatedResponse(data: unknown[], total: number, pagination: PaginationParams, extraData?: Record<string, unknown>) {
  return jsonResponse({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      total_pages: Math.ceil(total / pagination.limit),
      has_more: pagination.page * pagination.limit < total,
    },
    ...extraData,
  })
}

// Cache header helper
export function cachedJsonResponse(data: unknown, maxAgeSeconds: number) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`,
    },
  })
}

// Shared hash utility
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Unified authentication for all education endpoints
export async function authenticateEducationRequest(req: Request): Promise<EduAuthContext | null> {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // --- API Key auth ---
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const keyHash = await hashApiKey(apiKey)

    // Check student key first
    const { data: student } = await adminClient
      .from('edu_students')
      .select('id, organization_id, semester_id, status, ethics_certified, role')
      .eq('api_key_hash', keyHash)
      .eq('status', 'active')
      .single()

    if (student) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('id, tier, settings')
        .eq('id', student.organization_id)
        .eq('tier', 'education')
        .single()

      if (org) {
        return {
          orgId: org.id, org,
          role: 'student',
          userId: null,
          studentId: student.id,
          scopes: ['education:read', 'sandbox:read', 'projects:write'],
          adminClient,
        }
      }
    }

    // Check org API key
    const { data: keyRecord } = await adminClient
      .from('organization_api_keys')
      .select('organization_id, scopes')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyRecord) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('id, tier, settings')
        .eq('id', keyRecord.organization_id)
        .eq('tier', 'education')
        .single()

      if (org) {
        // Update last_used_at
        await adminClient
          .from('organization_api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('key_hash', keyHash)

        return {
          orgId: org.id, org,
          role: 'api_key',
          userId: null,
          studentId: null,
          scopes: (keyRecord.scopes as string[]) || [],
          adminClient,
        }
      }
    }
  }

  // --- JWT auth ---
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
  if (error || !claims?.claims?.sub) return null

  const userId = claims.claims.sub as string

  // Check org membership
  const { data: membership } = await adminClient
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .single()

  if (!membership) return null

  const { data: org } = await adminClient
    .from('organizations')
    .select('id, tier, settings')
    .eq('id', membership.organization_id)
    .eq('tier', 'education')
    .single()

  if (!org) return null

  // Check if user is also a student
  const { data: student } = await adminClient
    .from('edu_students')
    .select('id, ethics_certified')
    .eq('user_id', userId)
    .eq('organization_id', org.id)
    .single()

  return {
    orgId: org.id, org,
    role: membership.role,
    userId,
    studentId: student?.id || null,
    scopes: ['*'], // JWT users get all scopes based on role
    adminClient,
  }
}

// Role checks
export function isFaculty(role: string): boolean {
  return ['owner', 'admin', 'faculty', 'api_key'].includes(role)
}

export function isStudent(role: string): boolean {
  return role === 'student'
}

// Scope enforcement
export function hasScope(auth: EduAuthContext, requiredScope: string): boolean {
  if (auth.scopes.includes('*')) return true
  // Check exact match or wildcard (e.g., 'education:*' matches 'education:read')
  return auth.scopes.some(s => {
    if (s === requiredScope) return true
    const [group] = requiredScope.split(':')
    return s === `${group}:*`
  })
}

export function requireScope(auth: EduAuthContext, scope: string): Response | null {
  if (!hasScope(auth, scope)) {
    return errorResponse(
      ErrorCode.SCOPE_REQUIRED,
      `API key missing required scope: ${scope}`,
      403,
      { required_scope: scope, current_scopes: auth.scopes }
    )
  }
  return null
}

// Audit logging helper
export async function logAuditEvent(
  adminClient: ReturnType<typeof createClient>,
  orgId: string,
  entityType: string,
  activityType: string,
  entityId?: string,
  performedBy?: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    await adminClient.from('org_activity_log').insert({
      organization_id: orgId,
      entity_type: entityType,
      activity_type: activityType,
      entity_id: entityId || null,
      performed_by: performedBy || null,
      metadata: metadata || null,
    })
  } catch (e) {
    console.error('Audit log failed:', e)
  }
}
