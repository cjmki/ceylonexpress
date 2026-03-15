interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

interface ElksResponse {
  id: string
  status: string
  created: string
  direction: string
  from: string
  to: string
  message: string
}

const DEFAULT_COUNTRY_CODE = '+46'

/**
 * Normalize a phone number to E.164 format for 46elks.
 * Handles Swedish local numbers (0707...) and numbers missing the "+" prefix.
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '')

  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // "46707..." -> "+46707..."
  if (cleaned.startsWith('46') && cleaned.length > 8) {
    return `+${cleaned}`
  }

  // "0707..." -> "+46707..."
  if (cleaned.startsWith('0')) {
    return `${DEFAULT_COUNTRY_CODE}${cleaned.slice(1)}`
  }

  return `${DEFAULT_COUNTRY_CODE}${cleaned}`
}

export async function send46elksSMS(to: string, message: string): Promise<SMSResult> {
  const username = process.env.ELKS_API_USERNAME
  const password = process.env.ELKS_API_PASSWORD
  const from = process.env.ELKS_PHONE_NUMBER

  if (!username || !password || !from) {
    return {
      success: false,
      error: 'SMS service not configured. Check ELKS_API_USERNAME, ELKS_API_PASSWORD, and ELKS_PHONE_NUMBER environment variables.',
    }
  }

  try {
    const normalizedTo = normalizePhoneNumber(to)

    const response = await fetch('https://api.46elks.com/a1/sms', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ from, to: normalizedTo, message }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('46elks API error:', response.status, errorText)
      return {
        success: false,
        error: `SMS delivery failed (${response.status}): ${errorText}`,
      }
    }

    const data: ElksResponse = await response.json()

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    console.error('Failed to send SMS via 46elks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending SMS',
    }
  }
}
