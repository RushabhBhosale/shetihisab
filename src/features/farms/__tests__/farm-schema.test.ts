import { farmSchema } from '@/features/farms/farm-schema';

const validFarm = {
  name: 'Home Farm',
  village: '',
  totalArea: '',
  areaUnit: 'guntha' as const,
  notes: '',
};

describe('farmSchema', () => {
  it('requires a farm name', () => {
    const result = farmSchema.safeParse({ ...validFarm, name: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('validation.farmNameRequired');
    }
  });

  it('accepts a positive optional area', () => {
    expect(farmSchema.safeParse({ ...validFarm, totalArea: '2.5' }).success).toBe(true);
    expect(farmSchema.safeParse(validFarm).success).toBe(true);
  });

  it('rejects zero or negative area', () => {
    expect(farmSchema.safeParse({ ...validFarm, totalArea: '0' }).success).toBe(false);
    expect(farmSchema.safeParse({ ...validFarm, totalArea: '-1' }).success).toBe(false);
  });
});
