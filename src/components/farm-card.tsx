import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { Farm } from '@/types/app';
import { formatArea } from '@/utils/format';

interface FarmCardProps {
  farm: Farm;
  cropCount: number;
  onView: () => void;
}

export function FarmCard({ farm, cropCount, onView }: FarmCardProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const area = formatArea(farm.totalArea, farm.areaUnit, t(`units.${farm.areaUnit}`), language);

  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}>
      <View style={styles.heading}>
        <View
          accessible={false}
          style={[
            styles.icon,
            { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.pill },
          ]}>
          <Feather color={theme.colors.primary} name="map" size={29} />
        </View>
        <AppText accessibilityRole="header" variant="heading" weight="bold" style={styles.name}>
          {farm.name}
        </AppText>
      </View>
      {farm.village ? (
        <InfoLine icon="map-pin" text={farm.village} />
      ) : null}
      {area ? <InfoLine icon="maximize" text={area} /> : null}
      <InfoLine icon="sun" text={t('farms.cropCount', { count: cropCount })} />
      <LargeButton icon="eye" onPress={onView} title={t('common.view')} variant="secondary" />
    </SimpleCard>
  );
}

function InfoLine({ icon, text }: { icon: 'map-pin' | 'maximize' | 'sun'; text: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.info}>
      <Feather color={theme.colors.textSecondary} name={icon} size={24} />
      <AppText color="secondary">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
  },
  info: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
