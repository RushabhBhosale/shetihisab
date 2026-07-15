import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'farm-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Farm reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function scheduleReminderNotification(title: string, date: string, body: string) {
  try {
    const triggerDate = new Date(`${date}T09:00:00`);
    if (Number.isNaN(triggerDate.getTime()) || triggerDate.getTime() <= Date.now()) {
      return null;
    }
    if (!(await ensurePermission())) {
      return null;
    }
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { url: '/reminders' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: CHANNEL_ID,
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[ShetiHisab] Reminder notification could not be scheduled', error);
    }
    return null;
  }
}

export async function cancelReminderNotification(identifier: string | null) {
  if (!identifier) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    if (__DEV__) {
      console.warn('[ShetiHisab] Reminder notification could not be cancelled', error);
    }
  }
}
