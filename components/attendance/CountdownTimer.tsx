'use client'

import { useState, useEffect } from 'react'
import { getClockOutAvailableIn } from '@/lib/utils/date'

interface CountdownTimerProps {
  clockInTime: string
  workDurationMinutes: number
}

export function CountdownTimer({ clockInTime, workDurationMinutes }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => getClockOutAvailableIn(clockInTime, workDurationMinutes))

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getClockOutAvailableIn(clockInTime, workDurationMinutes)
      setRemaining(r)
      if (r.hours === 0 && r.minutes === 0) {
        clearInterval(interval)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [clockInTime, workDurationMinutes])

  if (remaining.hours === 0 && remaining.minutes === 0) {
    return null
  }

  return (
    <div className="text-center text-sm text-muted-foreground">
      Anda bisa clock out dalam {remaining.hours}j {remaining.minutes}m
    </div>
  )
}
