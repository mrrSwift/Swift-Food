// server/src/routes/payment.ts
import { Hono } from 'hono';
import { requestPayment, verifyPayment } from '../controllers/paymentController';

const payment = new Hono();

payment.post('/initiate', requestPayment);
payment.get('/verify', verifyPayment);   // Zarinpal callback

export default payment;