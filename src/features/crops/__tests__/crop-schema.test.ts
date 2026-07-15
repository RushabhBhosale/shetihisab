import { cropSchema } from '@/features/crops/crop-schema';

const validCrop = {
  cropName: 'Sugarcane',
  farmId: '',
  area: '',
  areaUnit: 'guntha' as const,
  season: '',
  plantingDate: '',
  expectedHarvestDate: '',
  notes: '',
};

describe('cropSchema', () => {
  it('requires a crop name', () => {
    const result = cropSchema.safeParse({ ...validCrop, cropName: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('validation.cropNameRequired');
    }
  });

  it('rejects an invalid optional area', () => {
    expect(cropSchema.safeParse({ ...validCrop, area: '0' }).success).toBe(false);
    expect(cropSchema.safeParse({ ...validCrop, area: 'two' }).success).toBe(false);
  });

  it('allows empty dates and correctly ordered dates', () => {
    expect(cropSchema.safeParse(validCrop).success).toBe(true);
    expect(
      cropSchema.safeParse({
        ...validCrop,
        plantingDate: '2026-07-01',
        expectedHarvestDate: '2026-12-01',
      }).success,
    ).toBe(true);
  });

  it('rejects a harvest date before the planting date', () => {
    const result = cropSchema.safeParse({
      ...validCrop,
      plantingDate: '2026-07-15',
      expectedHarvestDate: '2026-07-14',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('validation.harvestAfterPlanting');
      expect(result.error.issues[0]?.path).toEqual(['expectedHarvestDate']);
    }
  });
});
