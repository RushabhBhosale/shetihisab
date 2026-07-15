import { z } from 'zod';

export const reminderSchema = z.object({
  title: z.string().trim().min(1, 'validation.reminderTitle'),
  cropId: z.string(),
  date: z.string().min(1, 'validation.dateRequired'),
  notes: z.string().trim(),
});

export type ReminderFormValues = z.infer<typeof reminderSchema>;
