'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { clockIn } from '@/lib/actions/attendance'
import { useRouter } from 'next/navigation'
import { getFullFingerprint } from '@/lib/utils/fingerprint'
import { toast } from 'sonner'

interface ClockInButtonProps {
  officeToken: string
  disabled?: boolean
}

export function ClockInButton({ officeToken, disabled = false }: ClockInButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const fingerprint = getFullFingerprint()
      const userAgent = navigator.userAgent
      
      const result = await clockIn(officeToken, fingerprint, userAgent)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Berhasil clock in!')
        router.refresh()
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      size="lg"
      className="w-full text-lg py-8"
    >
      {isPending ? 'Memproses...' : 'Clock In'}
    </Button>
  )
}
