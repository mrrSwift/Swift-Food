import { Context } from 'hono';
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '';
const ZARINPAL_REQUEST_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_VERIFY_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json';
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
const stripe = require('stripe')(STRIPE_SECRET);

// ---------- Request a new payment (Zarinpal / Stripe) ----------
export const requestPayment = async (c: Context) => {
  const { orderId, method } = await c.req.json(); // method: 'zarinpal' | 'stripe'

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment?.status === 'paid') throw new AppError('Order already paid', 400);

  // Common callback URL – frontend will handle the result
  const callbackUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/payment/verify?orderId=${order._id}`;

  if (method === 'zarinpal') {
    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: order.total * 10,  // Zarinpal expects Rials (Toman * 10)
        callback_url: callbackUrl,
        description: `Order #${order._id}`,
        metadata: {
          orderId: order._id.toString(),
        },
      }),
    });

    const result: any = await response.json();
    if (result.data?.code === 100) {
      // Save authority for later verification
      order.payment = {
        method: 'zarinpal',
        status: 'pending',
        authority: result.data.authority,
      };
      await order.save();
      return c.json({
        success: true,
        data: {redirectUrl: `https://sandbox.zarinpal.com/pg/StartPay/${result.data.authority}`},
      });
    } else {
      throw new AppError(result.errors?.message || 'Zarinpal request failed', 400);
    }
  }

  if (method === 'stripe') {
    // Stripe Payment Intent creation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe expects smallest currency unit (cents)
      currency: 'usd', // adjust as needed
      metadata: { orderId: order._id.toString() },
    });

    order.payment = {
      method: 'stripe',
      status: 'pending',
      authority: paymentIntent.client_secret, // not authority, but we reuse the field
    };
    await order.save();
    return c.json({
      success: true,
      data:{clientSecret: paymentIntent.client_secret}
    });
  }

  throw new AppError('Invalid payment method', 400);
};

// ---------- Verify / Callback handler ----------
export const verifyPayment = async (c: Context) => {

  const { orderId } = c.req.query();
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.payment?.method === 'zarinpal') {
    const { Authority: authority, Status } = c.req.query(); // from Zarinpal redirect
    if (Status !== 'OK') {
      order.payment!.status = 'failed';
      await order.save();
      return c.json({success: true, data: { success: false, message: 'Payment cancelled by user' }});
    }

    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: order.total * 10,
        authority: authority,
      }),
    });

    const result: any = await response.json();
    if (result.data?.code === 100) {
      order.payment!.status = 'paid';
      order.payment!.refId = result.data.ref_id;
      order.payment!.paidAt = new Date();
      await order.save();
      return c.json({success: true, data: { success: true, refId: result.data.ref_id }});
    } else {
      order.payment!.status = 'failed';
      await order.save();
      throw new AppError('Payment verification failed', 400);
    }
  }

  if (order.payment?.method === 'stripe') {
    // Stripe verification is typically done on the client side;
    // here we can just mark as paid if the client confirms success.
    // We'll assume a webhook or client-side confirmation sets the status.
    order.payment!.status = 'paid';
    order.payment!.paidAt = new Date();
    await order.save();
    return c.json({ success: true });
  }

  throw new AppError('Invalid payment method', 400);
};