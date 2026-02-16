import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// HMAC-SHA256 consistent hashing for anonymization
async function generateHMAC(value: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(salt)
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Build session-scoped alias map using HMAC
class AnonymizationContext {
  private salt: string
  private nameCounter = 0
  private orgCounter = 0
  private caseCounter = 0
  private aliasMap = new Map<string, string>()
  private nameLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  constructor(studentId: string, serverSecret: string) {
    // Per-session salt derived from student ID + server secret
    this.salt = `${studentId}:${serverSecret}:${Date.now()}`
  }

  private getNextAlias(prefix: string, counter: number): string {
    if (counter < 26) {
      return `${prefix}-${this.nameLetters[counter]}`
    }
    return `${prefix}-${this.nameLetters[Math.floor(counter / 26) % 26]}${this.nameLetters[counter % 26]}`
  }

  async aliasName(original: string): Promise<string> {
    if (!original) return original
    const key = `name:${original}`
    if (this.aliasMap.has(key)) return this.aliasMap.get(key)!
    const alias = this.getNextAlias('Person', this.nameCounter++)
    this.aliasMap.set(key, alias)
    return alias
  }

  async aliasOrg(original: string): Promise<string> {
    if (!original) return original
    const key = `org:${original}`
    if (this.aliasMap.has(key)) return this.aliasMap.get(key)!
    const alias = this.getNextAlias('Org', this.orgCounter++)
    this.aliasMap.set(key, alias)
    return alias
  }

  async aliasCaseId(original: string): Promise<string> {
    if (!original) return original
    const key = `case:${original}`
    if (this.aliasMap.has(key)) return this.aliasMap.get(key)!
    const alias = this.getNextAlias('Case', this.caseCounter++)
    this.aliasMap.set(key, alias)
    return alias
  }

  generalizeAddress(address: string): string {
    if (!address) return address
    // Extract county/subcounty patterns common in Kenya
    const parts = address.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return parts.slice(-2).join(', ')
    }
    return parts[parts.length - 1] || 'Undisclosed Location'
  }

  getAnonymizedFields(): string[] {
    return Array.from(this.aliasMap.keys()).map(k => k.split(':')[0])
  }
}

// Anonymize a single record
async function anonymizeRecord(
  record: Record<string, unknown>,
  ctx: AnonymizationContext
): Promise<Record<string, unknown>> {
  const result = { ...record }

  // Strip PII fields
  const piiFields = ['phone', 'phone_number', 'contact_phone', 'email', 'contact_email',
    'donor_email', 'applicant_email', 'submitter_contact']
  for (const field of piiFields) {
    if (result[field]) result[field] = '[REDACTED]'
  }

  // Anonymize name fields
  const nameFields = ['name', 'full_name', 'client_name', 'donor_name', 'applicant_name',
    'submitter_name', 'contact_person', 'assigned_to']
  for (const field of nameFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = await ctx.aliasName(result[field] as string)
    }
  }

  // Anonymize org/provider names
  const orgFields = ['organization_name', 'provider_name', 'company_name']
  for (const field of orgFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = await ctx.aliasOrg(result[field] as string)
    }
  }

  // Anonymize case IDs and worker IDs
  if (result.case_number && typeof result.case_number === 'string') {
    result.case_number = await ctx.aliasCaseId(result.case_number as string)
  }
  if (result.caseworker_id) result.caseworker_id = '[REDACTED]'
  if (result.created_by) result.created_by = '[REDACTED]'
  if (result.user_id) result.user_id = '[REDACTED]'
  if (result.owner_user_id) result.owner_user_id = '[REDACTED]'

  // Generalize addresses
  const addressFields = ['location', 'address']
  for (const field of addressFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = ctx.generalizeAddress(result[field] as string)
    }
  }

  // Anonymize nested content in JSONB
  if (result.content && typeof result.content === 'object') {
    result.content = await anonymizeRecord(result.content as Record<string, unknown>, ctx)
  }
  if (result.metadata && typeof result.metadata === 'object') {
    result.metadata = await anonymizeRecord(result.metadata as Record<string, unknown>, ctx)
  }
  if (result.responses && typeof result.responses === 'object') {
    result.responses = await anonymizeRecord(result.responses as Record<string, unknown>, ctx)
  }

  result.anonymized = true
  return result
}

// Anonymize an array of records
async function anonymizeRecords(
  records: Record<string, unknown>[],
  ctx: AnonymizationContext
): Promise<Record<string, unknown>[]> {
  return Promise.all(records.map(r => anonymizeRecord(r, ctx)))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. POST with data to anonymize.' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { student_id, organization_id, endpoint, data } = await req.json()

    if (!student_id || !data) {
      return new Response(JSON.stringify({ error: 'student_id and data required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const serverSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'default-secret'
    const ctx = new AnonymizationContext(student_id, serverSecret)

    let anonymized: unknown
    if (Array.isArray(data)) {
      anonymized = await anonymizeRecords(data, ctx)
    } else if (typeof data === 'object') {
      anonymized = await anonymizeRecord(data as Record<string, unknown>, ctx)
    } else {
      anonymized = data
    }

    // Log anonymization event
    if (organization_id) {
      await adminClient.from('edu_anonymization_log').insert({
        organization_id,
        student_id,
        endpoint: endpoint || 'unknown',
        fields_anonymized: ctx.getAnonymizedFields(),
      })
    }

    return new Response(JSON.stringify({ data: anonymized, anonymized: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-anonymize error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
