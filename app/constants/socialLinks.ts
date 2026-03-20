export const SOCIAL_LINKS = {
  instagram: {
    url: 'https://www.instagram.com/ceylonexpress.se/',
    handle: '@ceylonexpress.se',
  },
  facebook: {
    url: 'https://www.facebook.com/ceylonexpressse',
    handle: 'ceylonexpressse',
  },
}

export const BUSINESS_INFO = {
  name: 'Ceylon Express',
  tagline: 'Sri Lankan Inspired',
  location: 'Stockholm, Sweden',
  description:
    'Authentic Sri Lankan cuisine coming soon to Stockholm',
}

const WHATSAPP_PREFILL = 'Hi Ceylon Express — I have a catering question:'

const PHONE_E164 = '+46702008888'
/** wa.me expects digits only (no +); must match PHONE_E164 */
const WHATSAPP_DIGITS = '46702008888'

/** Public customer line — single source of truth for UI and tel/wa.me links */
export const CONTACT_PHONE = {
  e164: PHONE_E164,
  display: '+46 70 200 88 88',
  whatsappDigits: WHATSAPP_DIGITS,
  telHref: `tel:${PHONE_E164}`,
  whatsappUrl: `https://wa.me/${WHATSAPP_DIGITS}`,
  whatsappUrlWithPrefill: `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`,
} as const

