import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'setup.profile.nameRequired'),
  village: z.string().trim().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
