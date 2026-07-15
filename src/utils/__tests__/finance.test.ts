import { getPaymentStatus, getSummaryDateRange, roundMoney } from '@/utils/finance';

describe('finance utilities', () => {
  it('rounds currency and derives payment statuses', () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(getPaymentStatus(100, 0)).toBe('pending');
    expect(getPaymentStatus(100, 50)).toBe('partiallyPaid');
    expect(getPaymentStatus(100, 100)).toBe('paid');
  });

  it('builds month, year, and all-time ranges', () => {
    const now = new Date(2026, 6, 15, 12);
    expect(getSummaryDateRange('month', now)).toEqual({ from: '2026-07-01', to: '2026-07-16' });
    expect(getSummaryDateRange('year', now)).toEqual({ from: '2026-01-01', to: '2026-07-16' });
    expect(getSummaryDateRange('all', now)).toEqual({ from: null, to: null });
  });
});
