import {
  corsHeaders, errorResponse, cachedJsonResponse, ErrorCode,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'apa').toLowerCase()
    const accessDate = url.searchParams.get('access_date') || new Date().toISOString().split('T')[0]
    const datasetVersion = url.searchParams.get('version') || '1.0'

    const validFormats = ['apa', 'mla', 'chicago']
    if (!validFormats.includes(format)) {
      return errorResponse(ErrorCode.VALIDATION_ERROR, `Invalid format. Use: ${validFormats.join(', ')}`, 400)
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

    // Citations are static — cache for 1 hour
    return cachedJsonResponse({
      format,
      citation,
      dataset_version: datasetVersion,
      access_date: accessDate,
      note: 'This citation covers anonymized, synthetic data provided through the GLO Education API sandbox environment.',
    }, 3600)
  } catch (error) {
    console.error('education-citation error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
