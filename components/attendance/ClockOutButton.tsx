'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { clockOut } from '@/lib/actions/attendance'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ClockOutButtonProps {
  officeToken: string
  disabled?: boolean
}

export function ClockOutButton({ officeToken, disabled = false }: ClockOutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const result = await clockOut(officeToken)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Berhasil clock out! Sampai jumpa besok.')
        router.refresh()
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      size="lg"
      variant="secondary"
      className="w-full text-lg py-8"
    >
      {isPending ? 'Memproses...' : 'Clock Out'}
    </Button>
  )
}
