import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Kenyan counties and subcounties for realistic data
const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi']
const subcounties: Record<string, string[]> = {
  'Nairobi': ['Westlands', 'Langata', 'Dagoretti', 'Kibra', 'Roysambu', 'Kasarani', 'Embakasi'],
  'Mombasa': ['Mvita', 'Nyali', 'Likoni', 'Kisauni', 'Changamwe', 'Jomvu'],
  'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 'Nyando'],
  'Nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Subukia'],
}

const caseCategories = ['protection', 'shelter', 'legal_aid', 'psychosocial', 'medical', 'economic_empowerment', 'education', 'referral']
const priorities = ['low', 'medium', 'high', 'critical']
const statuses = ['open', 'in_progress', 'pending_review', 'closed', 'referred']
const noteTypes = ['assessment', 'follow_up', 'referral', 'progress', 'closure']
const languages = ['en', 'sw', 'sheng']

// Multilingual content templates
const caseDescriptions: Record<string, string[]> = {
  en: [
    'Client seeking shelter after domestic incident. Referred by community health worker.',
    'Young person requesting educational support and mentorship program enrollment.',
    'Adult survivor requiring legal aid for custody proceedings and protection order.',
    'Family in need of economic empowerment through skills training program.',
    'Client requires psychosocial support following displacement from home.',
    'Adolescent seeking safe space and peer support group participation.',
    'Parent requesting family mediation and conflict resolution services.',
    'Survivor needing medical examination documentation and follow-up care.',
  ],
  sw: [
    'Mteja anahitaji makazi baada ya tukio la nyumbani. Ameelekezwa na mhudumu wa afya ya jamii.',
    'Kijana anaomba msaada wa elimu na kuandikishwa katika programu ya ushauri.',
    'Mtu mzima aliyenusurika anahitaji msaada wa kisheria kwa kesi za ulezi na amri ya ulinzi.',
    'Familia inayohitaji uwezeshaji wa kiuchumi kupitia programu ya mafunzo ya ujuzi.',
    'Mteja anahitaji msaada wa kisaikolojia baada ya kuhama nyumbani.',
    'Kijana balehe anatafuta nafasi salama na kushiriki kikundi cha msaada wa rika.',
    'Mzazi anaomba upatanishi wa familia na huduma za utatuzi wa migogoro.',
    'Aliyenusurika anahitaji nyaraka za uchunguzi wa kimatibabu na huduma ya ufuatiliaji.',
  ],
  sheng: [
    'Msee anataka place ya kukaa after mambo mob kwa hao. Community health worker ndio alimshow hapa.',
    'Kijana anataka msaada wa masomo na kujoin mentorship program.',
    'Mtu mzima survivor anahitaji help ya kisheria juu ya custody na protection order.',
    'Familia wanataka economic empowerment kupitia skills training.',
    'Mteja needs psychosocial support after kuhamishwa from home yake.',
    'Teen anatafuta safe space na peer support group.',
    'Parent anataka family mediation na conflict resolution services.',
    'Survivor needs medical exam documentation na follow-up care.',
  ],
}

const noteContents: Record<string, string[]> = {
  en: [
    'Initial assessment completed. Client presents with moderate anxiety. Safety plan established.',
    'Follow-up visit conducted. Client reports improved situation. Continuing support plan.',
    'Referral made to legal aid partner. Client provided with documentation checklist.',
    'Skills training enrollment confirmed. Client to begin next intake cycle.',
    'Case closure recommended. All service goals achieved. Client consents to exit.',
    'Progress review: client attending sessions regularly. Positive behavioral changes noted.',
  ],
  sw: [
    'Tathmini ya awali imekamilika. Mteja anaonyesha wasiwasi wa wastani. Mpango wa usalama umewekwa.',
    'Ziara ya ufuatiliaji imefanywa. Mteja anaripoti hali iliyoboreka. Kuendelea na mpango wa msaada.',
    'Rufaa imefanywa kwa mshirika wa msaada wa kisheria. Mteja amepewa orodha ya nyaraka.',
    'Uandikishaji wa mafunzo ya ujuzi umethibitishwa. Mteja ataanza katika mzunguko ujao.',
    'Kufungwa kwa kesi kunapendekezwa. Malengo yote ya huduma yamefikiwa.',
    'Mapitio ya maendeleo: mteja anahudhuria vikao mara kwa mara. Mabadiliko chanya yameonekana.',
  ],
  sheng: [
    'Initial assessment imekwisha. Msee ako na anxiety kidogo. Safety plan imewekwa.',
    'Follow-up visit imefanywa. Msee anasema mambo ni poa sai. Support plan inaendelea.',
    'Referral imefanywa kwa legal aid partner. Msee amepewa documents checklist.',
    'Skills training enrollment confirmed. Msee ataanza next cycle.',
    'Case closure recommended. Goals zote zimefikiwa. Client amekubali exit.',
    'Progress review: msee anaattend sessions regularly. Positive changes zimenoticiwa.',
  ],
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

function generateSyntheticCase(lang: string, index: number) {
  const county = randomItem(counties)
  const subs = subcounties[county] || ['Central']
  return {
    case_id: `CASE-${String(index + 1).padStart(4, '0')}`,
    category: randomItem(caseCategories),
    status: randomItem(statuses),
    priority: randomItem(priorities),
    county,
    subcounty: randomItem(subs),
    description: randomItem(caseDescriptions[lang] || caseDescriptions.en),
    opened_at: randomDate(new Date('2025-01-01'), new Date('2026-02-01')),
    closed_at: Math.random() > 0.6 ? randomDate(new Date('2025-06-01'), new Date('2026-02-15')) : null,
    tags: [randomItem(caseCategories), randomItem(['urgent', 'follow-up', 'new-intake', 'recurring'])],
    anonymized: true,
  }
}

function generateSyntheticNote(lang: string, caseId: string, index: number) {
  return {
    note_id: `NOTE-${String(index + 1).padStart(4, '0')}`,
    case_id: caseId,
    note_type: randomItem(noteTypes),
    content: randomItem(noteContents[lang] || noteContents.en),
    created_at: randomDate(new Date('2025-01-01'), new Date('2026-02-15')),
    anonymized: true,
  }
}

function generateSyntheticIntake(lang: string, index: number) {
  const county = randomItem(counties)
  return {
    submission_id: `INTAKE-${String(index + 1).padStart(4, '0')}`,
    form_type: randomItem(['general_intake', 'emergency_referral', 'self_referral', 'community_referral']),
    status: randomItem(['new', 'reviewed', 'assigned', 'completed']),
    priority: randomItem(priorities),
    county,
    responses_summary: randomItem(caseDescriptions[lang] || caseDescriptions.en),
    created_at: randomDate(new Date('2025-01-01'), new Date('2026-02-15')),
    anonymized: true,
  }
}

async function authenticateEducationUser(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    // Check student key
    const { data: student } = await adminClient
      .from('edu_students')
      .select('id, organization_id, ethics_certified, status')
      .eq('api_key_hash', keyHash)
      .eq('status', 'active')
      .single()

    if (student) {
      return { studentId: student.id, orgId: student.organization_id, role: 'student', ethicsCertified: student.ethics_certified, adminClient }
    }

    // Check org key
    const { data: keyRecord } = await adminClient
      .from('organization_api_keys')
      .select('organization_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyRecord) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('id, tier')
        .eq('id', keyRecord.organization_id)
        .eq('tier', 'education')
        .single()

      if (org) {
        return { studentId: null, orgId: org.id, role: 'faculty', ethicsCertified: true, adminClient }
      }
    }
  }

  // JWT auth
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

  // Check if student
  const { data: student } = await adminClient
    .from('edu_students')
    .select('id, organization_id, ethics_certified, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (student) {
    return { studentId: student.id, orgId: student.organization_id, role: 'student', ethicsCertified: student.ethics_certified, adminClient }
  }

  // Check if faculty
  const { data: membership } = await adminClient
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .in('role', ['owner', 'admin', 'faculty'])
    .single()

  if (membership) {
    const { data: org } = await adminClient
      .from('organizations')
      .select('id, tier')
      .eq('id', membership.organization_id)
      .eq('tier', 'education')
      .single()

    if (org) {
      return { studentId: null, orgId: org.id, role: 'faculty', ethicsCertified: true, adminClient }
    }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const auth = await authenticateEducationUser(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Sandbox is accessible even without ethics certification
    const url = new URL(req.url)
    const dataType = url.searchParams.get('type') || 'cases'
    const lang = url.searchParams.get('lang') || 'en'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const category = url.searchParams.get('category')

    if (!['cases', 'notes', 'intake'].includes(dataType)) {
      return new Response(JSON.stringify({ error: 'Invalid type. Use: cases, notes, intake' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!languages.includes(lang)) {
      return new Response(JSON.stringify({ error: `Invalid language. Use: ${languages.join(', ')}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check for pre-generated sandbox data in DB first
    const { data: storedData } = await auth.adminClient
      .from('edu_sandbox_data')
      .select('content')
      .eq('data_type', dataType)
      .eq('language', lang)
      .or(`organization_id.eq.${auth.orgId},organization_id.is.null`)
      .limit(limit)
      .range((page - 1) * limit, page * limit - 1)

    if (storedData && storedData.length > 0) {
      const records = storedData.map(d => ({ ...d.content as Record<string, unknown>, anonymized: true }))

      // Update last_active_at for student
      if (auth.studentId) {
        await auth.adminClient
          .from('edu_students')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', auth.studentId)

        // Log API usage
        await auth.adminClient.from('edu_api_usage').insert({
          organization_id: auth.orgId,
          student_id: auth.studentId,
          endpoint: `/education/sandbox?type=${dataType}`,
          method: 'GET',
          status_code: 200,
          is_sandbox: true,
        })
      }

      return new Response(JSON.stringify({
        data: records,
        pagination: { page, limit, total: records.length },
        sandbox: true,
        anonymized: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Generate synthetic data on-the-fly
    const totalRecords = dataType === 'cases' ? 500 : 300
    const startIdx = (page - 1) * limit
    let records: unknown[] = []

    if (dataType === 'cases') {
      records = Array.from({ length: Math.min(limit, totalRecords - startIdx) }, (_, i) => {
        const c = generateSyntheticCase(lang, startIdx + i)
        return category ? (c.category === category ? c : null) : c
      }).filter(Boolean)
    } else if (dataType === 'notes') {
      const caseId = url.searchParams.get('case_id') || `CASE-${String(Math.floor(Math.random() * 500) + 1).padStart(4, '0')}`
      records = Array.from({ length: Math.min(limit, 50) }, (_, i) =>
        generateSyntheticNote(lang, caseId, startIdx + i)
      )
    } else if (dataType === 'intake') {
      records = Array.from({ length: Math.min(limit, totalRecords - startIdx) }, (_, i) =>
        generateSyntheticIntake(lang, startIdx + i)
      )
    }

    // Update last_active_at and log for students
    if (auth.studentId) {
      await auth.adminClient
        .from('edu_students')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', auth.studentId)

      await auth.adminClient.from('edu_api_usage').insert({
        organization_id: auth.orgId,
        student_id: auth.studentId,
        endpoint: `/education/sandbox?type=${dataType}`,
        method: 'GET',
        status_code: 200,
        is_sandbox: true,
      })
    }

    return new Response(JSON.stringify({
      data: records,
      pagination: { page, limit, total: totalRecords },
      sandbox: true,
      anonymized: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-sandbox error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
