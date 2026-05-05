'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/scan')
}

export async function register(formData: FormData) {
  const supabase = createClient()
  const serviceClient = createServiceClient() // Use this for internal checks
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const officeToken = formData.get('office_token') as string

  const { data: office } = await serviceClient
    .from('offices')
    .select('id')
    .eq('qr_code_token', officeToken)
    .single()

  if (!office) {
    return { error: 'Token kantor tidak valid' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Check if user is already confirmed (if email confirmation is off)
    // or if we should proceed with profile update
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        office_id: office.id,
        role: 'employee',
      })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
    }

    if (data.session) {
       revalidatePath('/', 'layout')
       redirect(`/scan?office=${officeToken}`)
    } else {
       return { error: 'Silakan cek email Anda untuk verifikasi akun (jika diaktifkan di Supabase).' }
    }
  }

  return { error: 'Pendaftaran gagal' }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
