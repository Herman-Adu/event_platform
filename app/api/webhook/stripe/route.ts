import stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'

// post event triggered by the webhook as ssoon as the order is completed srtipe 
// will ping our endpoint below providing all the data in the body of the request

export async function POST(request: Request) {
    const body = await request.text()

    // get stripe signature and secret
    const sig = request.headers.get('stripe-signature') as string
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
        return NextResponse.json({ message: 'Webhook error', error: err })
    }

    // Get the ID and type
    const eventType = event.type

    // CREATE - listen for a specific event type - checkout.session.completed
    // if event type is checkout.session.completed, then we form event.data.object with all the order information
    if (eventType === 'checkout.session.completed') {
        const { id, amount_total, metadata } = event.data.object

   
      const order = {
        stripeId: id,
        eventId: metadata?.eventId || '',
        buyerId: metadata?.buyerId || '',
        totalAmount: amount_total ? (amount_total / 100).toString() : '0',
        createdAt: new Date(),
      }

      // pass it to the createOrder action
      const newOrder = await createOrder(order)
      return NextResponse.json({ message: 'OK', order: newOrder })
    }

  return new Response('', { status: 200 })
}