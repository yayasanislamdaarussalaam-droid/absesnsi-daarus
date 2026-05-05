export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''

  let fingerprint = localStorage.getItem('device_fingerprint')
  if (!fingerprint) {
    fingerprint = crypto.randomUUID()
    localStorage.setItem('device_fingerprint', fingerprint)
  }
  return fingerprint
}

export function getFullFingerprint(): string {
  if (typeof window === 'undefined') return ''

  const stored = getDeviceFingerprint()
  const ua = navigator.userAgent
  return btoa(`${stored}:${ua}`).slice(0, 255)
}
