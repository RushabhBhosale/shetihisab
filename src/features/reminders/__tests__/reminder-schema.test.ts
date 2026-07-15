import { reminderSchema } from '@/features/reminders/reminder-schema';

describe('reminderSchema', () => {
  it('requires a title and date while allowing no crop', () => {
    expect(reminderSchema.safeParse({ title: 'Water crop', cropId: '', date: '2026-07-15', notes: '' }).success).toBe(true);
    expect(reminderSchema.safeParse({ title: '', cropId: '', date: '2026-07-15', notes: '' }).success).toBe(false);
    expect(reminderSchema.safeParse({ title: 'Water crop', cropId: '', date: '', notes: '' }).success).toBe(false);
  });
});
