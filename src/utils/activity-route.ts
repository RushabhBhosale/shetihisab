import type { Href } from 'expo-router';

import type { ActivityItem } from '@/types/app';

export function getActivityRoute(activity: ActivityItem): Href {
  const routes = {
    expense: `/expenses/${activity.entityId}`,
    income: `/incomes/${activity.entityId}`,
    payment: `/payments/edit/${activity.entityId}`,
    crop: `/crops/${activity.entityId}`,
    reminder: `/reminders/${activity.entityId}`,
  } as const;
  return routes[activity.kind];
}
