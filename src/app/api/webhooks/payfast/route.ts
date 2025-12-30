import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayFastSignature } from '@/lib/payfast/client'

// Simple in-memory rate limiting (for production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // Max 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  record.count++
  return true
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Verify request is from PayFast (optional: add IP whitelist)
    const payfastIPs = [
      '197.97.145.144',
      '41.74.179.194',
      '41.74.179.195',
      '41.74.179.196',
      '41.74.179.197',
      '197.97.145.145',
    ]
    
    const requestIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    
    // Only enforce IP whitelist in production
    if (process.env.NODE_ENV === 'production' && requestIP && !payfastIPs.includes(requestIP)) {
      console.warn(`Webhook request from unauthorized IP: ${requestIP}`)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse form data from PayFast
    const formData = await request.formData()
    const data: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    // Extract signature
    const receivedSignature = data.signature
    if (!receivedSignature) {
      console.error('No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify PayFast signature
    const isValid = verifyPayFastSignature(data, receivedSignature)
    if (!isValid) {
      console.error('Invalid PayFast signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Get payment details
    const {
      payment_status,
      m_payment_id, // Custom field - should be user ID
      token,
      amount_gross,
      billing_date,
    } = data

    const supabase = await createClient()

    // Handle different payment statuses
    switch (payment_status) {
      case 'COMPLETE':
        // Payment successful - activate subscription
        await handleSuccessfulPayment(supabase, {
          userId: m_payment_id,
          token,
          amount: parseFloat(amount_gross),
          billingDate: billing_date,
        })
        break

      case 'CANCELLED':
        // Subscription cancelled
        await handleCancelledSubscription(supabase, {
          userId: m_payment_id,
          token,
        })
        break

      case 'FAILED':
        // Payment failed
        console.error('Payment failed for user:', m_payment_id)
        break

      default:
        console.log('Unhandled payment status:', payment_status)
    }

    // PayFast expects a 200 OK response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PayFast webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(
  supabase: any,
  data: {
    userId: string
    token: string
    amount: number
    billingDate: string
  }
) {
  const { userId, token, amount, billingDate } = data

  // Calculate next billing date (1 month from now)
  const nextBillingDate = new Date(billingDate)
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

  // Update or create subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      payfast_subscription_id: token,
      status: 'active',
      plan: 'premium',
      amount,
      billing_date: billingDate,
      next_billing_date: nextBillingDate.toISOString(),
    })

  if (subError) {
    console.error('Error updating subscription:', subError)
    throw subError
  }

  // Update user's subscription tier
  const subscriptionExpiresAt = new Date(nextBillingDate)
  subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 7) // Grace period

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'premium',
      subscription_expires_at: subscriptionExpiresAt.toISOString(),
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    throw profileError
  }

  // TODO: Send notification to user about successful payment
  console.log('Subscription activated for user:', userId)
}

async function handleCancelledSubscription(
  supabase: any,
  data: {
    userId: string
    token: string
  }
) {
  const { userId, token } = data

  // Update subscription status
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('payfast_subscription_id', token)

  if (subError) {
    console.error('Error cancelling subscription:', subError)
    throw subError
  }

  // Downgrade user to free tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_expires_at: null,
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error downgrading profile:', profileError)
    throw profileError
  }

  // TODO: Send notification to user about cancellation
  console.log('Subscription cancelled for user:', userId)
}

