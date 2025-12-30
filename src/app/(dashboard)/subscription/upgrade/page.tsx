import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function UpgradePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier === 'premium') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">You're already a premium member!</h1>
          <p className="text-muted-foreground mt-2">
            Enjoy all the premium features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Premium Membership Active</CardTitle>
            <CardDescription>
              Your subscription is active until{' '}
              {profile.subscription_expires_at
                ? new Date(profile.subscription_expires_at).toLocaleDateString()
                : 'renewal date'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Upgrade to Premium</h1>
        <p className="text-xl text-muted-foreground">
          Unlock unlimited groups, events, and exclusive features
        </p>
      </div>

      {/* Pricing Comparison */}
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {/* Free Tier */}
        <Card className="relative">
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-4xl font-bold">R0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <CardDescription>Perfect for getting started</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Join up to 3 groups</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Create 1 event per month</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm">Basic profile visibility</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-sm text-muted-foreground">No direct messaging</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-sm text-muted-foreground">Standard matching priority</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-sm text-muted-foreground">No analytics dashboard</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Premium Tier */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="text-4xl font-bold">R99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <CardDescription>Unlock the full experience</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Unlimited group membership</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Unlimited event creation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Enhanced profile visibility</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Direct messaging enabled</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Priority matching algorithm</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Custom badge display</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-sm font-medium">Priority customer support</span>
              </div>
            </div>
            <form action={`${process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'}`} method="POST">
              <input type="hidden" name="merchant_id" value={process.env.PAYFAST_MERCHANT_ID} />
              <input type="hidden" name="merchant_key" value={process.env.PAYFAST_MERCHANT_KEY} />
              <input type="hidden" name="return_url" value={`${process.env.NEXT_PUBLIC_APP_URL}/profile?upgraded=true`} />
              <input type="hidden" name="cancel_url" value={`${process.env.NEXT_PUBLIC_APP_URL}/subscription/upgrade`} />
              <input type="hidden" name="notify_url" value={`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payfast`} />
              <input type="hidden" name="amount" value="99.00" />
              <input type="hidden" name="item_name" value="EventConnect Premium Subscription" />
              <input type="hidden" name="item_description" value="Monthly Premium Subscription" />
              <input type="hidden" name="email_address" value={user.email} />
              <input type="hidden" name="m_payment_id" value={user.id} />
              <input type="hidden" name="subscription_type" value="1" />
              <input type="hidden" name="billing_date" value={new Date().toISOString().split('T')[0]} />
              <input type="hidden" name="recurring_amount" value="99.00" />
              <input type="hidden" name="frequency" value="3" />
              <input type="hidden" name="cycles" value="0" />
              
              <Button type="submit" className="w-full" size="lg">
                Upgrade Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Features Breakdown */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <CardTitle>Unlimited Access</CardTitle>
            <CardDescription>
              Join as many groups as you want and create unlimited events
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <CardTitle>Direct Messaging</CardTitle>
            <CardDescription>
              Connect and chat directly with your connections
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Get insights into your engagement and network growth
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, debit cards, and instant EFT through PayFast.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is my payment information secure?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! All payments are processed securely through PayFast, a trusted South African payment gateway. We never store your payment information.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What happens if I downgrade to free?</h4>
            <p className="text-sm text-muted-foreground">
              You can keep your existing group memberships and events, but you won't be able to join new groups beyond the free limit or create new events until the next month.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

