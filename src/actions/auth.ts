'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, resetPasswordSchema } from '@/lib/validations/auth'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validatedData = loginSchema.parse(rawData)

  const { error } = await supabase.auth.signInWithPassword(validatedData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    username: formData.get('username') as string,
    fullName: formData.get('fullName') as string,
  }

  const validatedData = registerSchema.parse(rawData)

  const { error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        username: validatedData.username,
        full_name: validatedData.fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
  }

  const validatedData = resetPasswordSchema.parse(rawData)

  const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password/confirm`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

