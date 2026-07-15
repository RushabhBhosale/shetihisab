import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ScreenContainer } from '@/components/screen-container';

export default function HistoryScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll={false}>
      <AppHeader title={t('history.title')} />
      <EmptyState
        description={t('history.emptyDescription')}
        icon="book-open"
        title={t('history.emptyTitle')}
      />
    </ScreenContainer>
  );
}
