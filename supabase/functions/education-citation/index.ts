const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'apa').toLowerCase()
    const accessDate = url.searchParams.get('access_date') || new Date().toISOString().split('T')[0]
    const datasetVersion = url.searchParams.get('version') || '1.0'

    const validFormats = ['apa', 'mla', 'chicago']
    if (!validFormats.includes(format)) {
      return new Response(JSON.stringify({
        error: `Invalid format. Use: ${validFormats.join(', ')}`
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const year = new Date(accessDate).getFullYear()
    const formattedDate = new Date(accessDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    let citation: string

    switch (format) {
      case 'apa':
        citation = `Project GLO. (${year}). GLO platform anonymized dataset (Version ${datasetVersion}) [Data set]. Project GLO. https://projectglo.org`
        break
      case 'mla':
        citation = `"GLO Platform Anonymized Dataset." Project GLO, version ${datasetVersion}, ${year}, projectglo.org. Accessed ${formattedDate}.`
        break
      case 'chicago':
        citation = `Project GLO. "GLO Platform Anonymized Dataset." Version ${datasetVersion}. Accessed ${formattedDate}. https://projectglo.org.`
        break
      default:
        citation = ''
    }

    return new Response(JSON.stringify({
      format,
      citation,
      dataset_version: datasetVersion,
      access_date: accessDate,
      note: 'This citation covers anonymized, synthetic data provided through the GLO Education API sandbox environment.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-citation error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
