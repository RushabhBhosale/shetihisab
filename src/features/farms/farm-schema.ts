import { z } from 'zod';

const optionalPositiveArea = z.string().trim().refine(
  (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0),
  'validation.validArea',
);

export const farmSchema = z.object({
  name: z.string().trim().min(1, 'validation.farmNameRequired'),
  village: z.string().trim(),
  totalArea: optionalPositiveArea,
  areaUnit: z.enum(['guntha', 'acre', 'hectare']),
  notes: z.string().trim(),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
