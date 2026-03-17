import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id

    if (!userId) {
      console.error('No user ID in session metadata')
      return NextResponse.json({ error: 'No user ID' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update Pro status:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log(`User ${userId} upgraded to Pro`)
  }

  return NextResponse.json({ received: true })
}