import { z } from 'zod';

const optionalPositiveArea = z.string().trim().refine(
  (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0),
  'validation.validArea',
);

export const cropSchema = z
  .object({
    cropName: z.string().trim().min(1, 'validation.cropNameRequired'),
    farmId: z.string(),
    area: optionalPositiveArea,
    areaUnit: z.enum(['guntha', 'acre', 'hectare']),
    season: z.string().trim(),
    plantingDate: z.string(),
    expectedHarvestDate: z.string(),
    notes: z.string().trim(),
  })
  .refine(
    (values) =>
      !values.plantingDate ||
      !values.expectedHarvestDate ||
      values.expectedHarvestDate >= values.plantingDate,
    {
      message: 'validation.harvestAfterPlanting',
      path: ['expectedHarvestDate'],
    },
  );

export type CropFormValues = z.infer<typeof cropSchema>;
