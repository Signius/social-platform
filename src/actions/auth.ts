'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, resetPasswordSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'
import type { AuthResult } from '@/types/actions'

// Helper to check if an error is a Next.js redirect error
function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const errorObj = error as any
  return (
    (errorObj.digest && typeof errorObj.digest === 'string' && errorObj.digest.startsWith('NEXT_REDIRECT')) ||
    (errorObj.message && typeof errorObj.message === 'string' && errorObj.message === 'NEXT_REDIRECT')
  )
}

export async function login(formData: FormData): Promise<AuthResult | never> {
  let supabase
  let validatedData

  try {
    supabase = await createClient()

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate input
    try {
      validatedData = loginSchema.parse(rawData)
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]
        return { error: `${firstError.path.join('.')}: ${firstError.message}` }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in login (setup):', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword(validatedData)

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { 
          error: 'Please verify your email before logging in',
          requiresVerification: true 
        }
      }
      console.error('Login error:', error)
      return { error: 'Unable to log in. Please try again.' }
    }

    if (!data.user) {
      return { error: 'Authentication failed. Please try again.' }
    }

    try {
      revalidatePath('/', 'layout')
    } catch (revalidateError) {
      // Log but don't fail on revalidatePath errors
      console.error('Error revalidating path:', revalidateError)
    }
    
    // Redirect outside try-catch so it can propagate naturally
    redirect('/dashboard')
  } catch (error) {
    // Re-throw redirect errors - they're expected in Next.js
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Unexpected error in login (auth):', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function register(formData: FormData): Promise<AuthResult | never> {
  try {
    const supabase = await createClient()

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      username: formData.get('username') as string,
      fullName: formData.get('fullName') as string,
    }

    // Validate input
    const validatedData = registerSchema.parse(rawData)

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedData.username.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return { error: 'Username is already taken. Please choose a different username.' }
    }

    // Supabase Auth handles email uniqueness, so we don't need to check it separately
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          username: validatedData.username.toLowerCase(),
          full_name: validatedData.fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      // Handle specific registration errors
      if (error.message.includes('User already registered')) {
        return { error: 'An account with this email already exists' }
      }
      if (error.message.includes('Password should be')) {
        return { error: 'Password must be at least 6 characters long' }
      }
      console.error('Registration error:', error)
      return { error: 'Unable to create account. Please try again.' }
    }

    if (!data.user) {
      return { error: 'Registration failed. Please try again.' }
    }

    // Check if email verification is required
    if (data.user && !data.session) {
      return {
        success: true,
        requiresVerification: true,
        error: 'Please check your email to verify your account before logging in.'
      }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    // Re-throw redirect errors - they're expected in Next.js
    if (isRedirectError(error)) {
      throw error
    }
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in register:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut(): Promise<never> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
    }
    
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    // Re-throw redirect errors - they're expected in Next.js
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Unexpected error in signOut:', error)
    // Still redirect even if sign out fails
    redirect('/login')
  }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const rawData = {
      email: formData.get('email') as string,
    }

    // Validate input
    const validatedData = resetPasswordSchema.parse(rawData)

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password/confirm`,
    })

    if (error) {
      console.error('Reset password error:', error)
      return { error: 'Unable to send reset email. Please check your email address and try again.' }
    }

    return { 
      success: true,
      error: 'If an account exists with this email, you will receive a password reset link.'
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in resetPassword:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

