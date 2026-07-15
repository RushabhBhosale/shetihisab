import { profileSchema } from '@/features/profile/profile-schema';

describe('profileSchema', () => {
  it('requires a non-empty name', () => {
    const result = profileSchema.safeParse({ name: '   ', village: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('setup.profile.nameRequired');
    }
  });

  it('allows an optional village', () => {
    const result = profileSchema.safeParse({ name: 'Ramesh' });

    expect(result.success).toBe(true);
  });
});
