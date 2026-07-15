import type { PaymentStatus, SummaryRange } from '@/types/app';
import { toIsoDate } from '@/utils/format';

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getPaymentStatus(totalAmount: number, amountReceived: number): PaymentStatus {
  if (amountReceived <= 0) {
    return 'pending';
  }
  return amountReceived >= totalAmount ? 'paid' : 'partiallyPaid';
}

export function getSummaryDateRange(range: SummaryRange, now = new Date()) {
  if (range === 'all') {
    return { from: null, to: null };
  }

  const from =
    range === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return { from: toIsoDate(from), to: toIsoDate(to) };
}
