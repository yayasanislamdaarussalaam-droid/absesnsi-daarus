/**
 * WhatsApp Utility using WAGate API
 * Free tier: 500 messages/month
 * Docs: https://wagate.in/docs
 */

const WAGATE_API_URL = 'https://api.wagate.in/v1'
const WAGATE_TOKEN = process.env.WAGATE_TOKEN || ''

export interface SendMessageResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Send WhatsApp message via WAGate
 * @param phone - Phone number with country code (e.g., 628123456789)
 * @param message - Message text
 */
export async function sendWhatsApp(
  phone: string | null | undefined,
  message: string
): Promise<SendMessageResponse> {
  if (!phone) {
    return { success: false, error: 'Phone number is empty' }
  }

  if (!WAGATE_TOKEN) {
    console.error('WAGATE_TOKEN is not set')
    return { success: false, error: 'WhatsApp API token not configured' }
  }

  // Format phone number (remove +, ensure starts with country code)
  let formattedPhone = phone.replace(/[^\d]/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1)
  }
  if (!formattedPhone.startsWith('62')) {
    formattedPhone = '62' + formattedPhone
  }

  try {
    const response = await fetch(`${WAGATE_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAGATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: formattedPhone,
        message: message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      }
    }

    return { success: true, message: 'Message sent successfully' }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Format reminder message for clock-in
 */
export function formatClockInReminder(name: string, minutesLeft: number): string {
  if (minutesLeft <= 0) {
    return `Halo ${name}! 🙏\nWaktunya masuk kerja sekarang!\nJangan lupa scan QR Code di kantor ya!`
  }
  return `Halo ${name}! ⏰\n${minutesLeft} menit lagi jam masuk kerja lho!\nJangan lupa siapin buat scan QR ya! 😊`
}

/**
 * Format reminder message for clock-out
 */
export function formatClockOutReminder(name: string, minutesLeft: number): string {
  if (minutesLeft <= 0) {
    return `Halo ${name}! 🙏\nWaktunya pulang sekarang!\nJangan lupa clock out scan QR Code ya!`
  }
  return `Halo ${name}! ⏰\n${minutesLeft} menit lagi jam pulang!\nJangan lupa clock out scan QR ya! 😊`
}
