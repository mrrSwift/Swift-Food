import Order from '../models/Order';

const UNPAID_TIMEOUT_MINUTES = 10;

export async function cancelUnpaidOrders(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - UNPAID_TIMEOUT_MINUTES * 60 * 1000);

    const result = await Order.updateMany(
      {
        'deliveryOption': 'delivery',
        'payment.status': 'pending',
        'payment.method': { $in: ['zarinpal', 'stripe'] },
        'status': 'pending',
        'createdAt': { $lt: cutoff },
      },
      {
        $set: {
          status: 'cancelled',
          'payment.status': 'failed',
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Cron: Cancelled ${result.modifiedCount} unpaid delivery order(s) older than ${UNPAID_TIMEOUT_MINUTES} minutes.`);
    }
  } catch (error) {
    console.error('❌ Cron job cancelUnpaidOrders failed:', error);
  }
}