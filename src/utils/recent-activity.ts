import type { Crop, Farm } from '@/types/app';

export interface RecentActivity {
  id: string;
  type: 'farm' | 'crop';
  name: string;
  action: 'added' | 'updated';
  date: string;
}

function activityAction(createdAt: string, updatedAt: string) {
  return createdAt === updatedAt ? ('added' as const) : ('updated' as const);
}

export function buildRecentActivity(farms: Farm[], crops: Crop[]): RecentActivity[] {
  const farmActivity = farms.map<RecentActivity>((farm) => ({
    id: `farm-${farm.id}`,
    type: 'farm',
    name: farm.name,
    action: activityAction(farm.createdAt, farm.updatedAt),
    date: farm.updatedAt,
  }));
  const cropActivity = crops.map<RecentActivity>((crop) => ({
    id: `crop-${crop.id}`,
    type: 'crop',
    name: crop.cropName,
    action: activityAction(crop.createdAt, crop.updatedAt),
    date: crop.updatedAt,
  }));

  return [...farmActivity, ...cropActivity]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 20);
}
