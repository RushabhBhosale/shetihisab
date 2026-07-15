import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { SimpleCard } from '@/components/simple-card';
import { StatusLabel } from '@/components/status-label';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { Crop } from '@/types/app';
import { formatArea, formatDate } from '@/utils/format';

interface CropCardProps {
  crop: Crop;
  onView: () => void;
  compact?: boolean;
}

export function CropCard({ crop, onView, compact = false }: CropCardProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const area = formatArea(crop.area, crop.areaUnit, t(`units.${crop.areaUnit}`), language);
  const plantingDate = formatDate(crop.plantingDate, language);

  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}>
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          <AppText accessibilityRole="header" variant="heading" weight="bold">
            {crop.cropName}
          </AppText>
          {crop.farmName ? (
            <AppText color="secondary" variant="small">
              {crop.farmName}
            </AppText>
          ) : null}
        </View>
        {!compact ? (
          <StatusLabel
            label={t(crop.status === 'active' ? 'crops.statusActive' : 'crops.statusCompleted')}
            status={crop.status}
          />
        ) : null}
      </View>
      {area ? <InfoLine icon="maximize" text={area} /> : null}
      {plantingDate ? (
        <InfoLine icon="calendar" text={t('crops.plantedOn', { date: plantingDate })} />
      ) : null}
      <LargeButton
        icon="eye"
        onPress={onView}
        title={compact ? t('common.view') : t('crops.viewDetails')}
        variant="secondary"
      />
    </SimpleCard>
  );
}

function InfoLine({ icon, text }: { icon: 'maximize' | 'calendar'; text: string }) {
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
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  info: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
