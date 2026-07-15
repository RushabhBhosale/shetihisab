import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ScreenContainer } from '@/components/screen-container';

export default function CropsScreen() {
  const { t } = useTranslation();
  const showComingSoon = () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoon'));

  return (
    <ScreenContainer scroll={false}>
      <AppHeader title={t('crops.title')} />
      <EmptyState
        actionLabel={t('crops.addCrop')}
        description={t('crops.emptyDescription')}
        icon="sun"
        onAction={showComingSoon}
        title={t('crops.emptyTitle')}
      />
    </ScreenContainer>
  );
}
