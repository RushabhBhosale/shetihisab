import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DetailRow } from '@/components/detail-row';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { PaymentStatusLabel } from '@/components/payment-status-label';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { incomeRepository } from '@/database/repositories/income-repository';
import { paymentRepository } from '@/database/repositories/payment-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import type { Payment } from '@/types/app';
import { formatCurrency, formatDate } from '@/utils/format';

export default function IncomeDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const incomeId = Number(useLocalSearchParams<{ id?: string }>().id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loadData = useCallback(async () => {
    const [income, payments] = await Promise.all([
      incomeRepository.getIncomeById(incomeId),
      paymentRepository.getPaymentsByIncomeId(incomeId),
    ]);
    if (!income) throw new Error('Income not found.');
    return { income, payments };
  }, [incomeId]);
  const { data, loading, error, reload } = useScreenData(loadData);
  if (loading && !data) return <LoadingScreen message={t('incomes.loading')} />;
  if (error || !data) return <ErrorState message={t('incomes.notFound')} onRetry={() => void reload()} />;
  const { income, payments } = data;
  const removeIncome = async () => {
    setDeleting(true);
    try {
      await incomeRepository.deleteIncome(income.id);
      setConfirmDelete(false);
      Alert.alert(t('common.saved'), t('incomes.deleted'), [
        { text: t('common.continue'), onPress: () => router.replace('/incomes') },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setDeleting(false);
    }
  };
  const confirmPaymentDelete = (payment: Payment) => {
    Alert.alert(t('payments.deleteTitle'), t('payments.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await paymentRepository.deletePayment(payment.id);
            Alert.alert(t('common.saved'), t('payments.deleted'));
            await reload();
          } catch {
            Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
          }
        },
      },
    ]);
  };
  return (
    <>
      <ScreenContainer>
        <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('incomes.detailsTitle')} />
        <AppText variant="title" weight="bold">{income.cropName ?? t('incomes.income')}</AppText>
        <View style={{ marginTop: theme.spacing.md }}><PaymentStatusLabel label={t(`paymentStatus.${income.paymentStatus}`)} status={income.paymentStatus} /></View>
        <SimpleCard style={[styles.details, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <DetailRow icon="dollar-sign" label={t('incomes.totalAmount')} value={formatCurrency(income.totalAmount, language)} />
          <DetailRow icon="check-circle" label={t('incomes.amountReceived')} value={formatCurrency(income.amountReceived, language)} />
          <DetailRow icon="clock" label={t('incomes.pendingAmount')} value={formatCurrency(income.pendingAmount, language)} />
          {income.buyerName ? <DetailRow icon="user" label={t('incomes.buyerName')} value={income.buyerName} /> : null}
          {income.quantity !== null ? <DetailRow icon="package" label={t('incomes.quantity')} value={`${income.quantity} ${income.unit ?? ''}`.trim()} /> : null}
          {income.rate !== null ? <DetailRow icon="tag" label={t('incomes.rate')} value={formatCurrency(income.rate, language)} /> : null}
          <DetailRow icon="calendar" label={t('common.date')} value={formatDate(income.date, language) ?? income.date} />
          {income.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={income.notes} /> : null}
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          {income.pendingAmount > 0 ? <LargeButton icon="plus" onPress={() => router.push({ pathname: '/payments/add', params: { incomeId: String(income.id) } })} title={t('payments.addPayment')} /> : null}
          <LargeButton icon="edit-2" onPress={() => router.push(`/incomes/edit/${income.id}`)} title={t('incomes.editIncome')} variant="secondary" />
          <LargeButton icon="trash-2" onPress={() => setConfirmDelete(true)} title={t('incomes.deleteIncome')} variant="danger" />
        </View>
        <View style={[styles.payments, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
          <AppText variant="heading" weight="bold">{t('payments.title')}</AppText>
          {payments.length ? payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} onDelete={() => confirmPaymentDelete(payment)} onEdit={() => router.push(`/payments/edit/${payment.id}`)} />
          )) : <SimpleCard><AppText color="secondary" style={styles.center}>{t('payments.empty')}</AppText></SimpleCard>}
        </View>
      </ScreenContainer>
      <ConfirmationDialog cancelLabel={t('common.cancel')} confirmLabel={t('incomes.deleteIncome')} destructive loading={deleting} message={t('incomes.deleteMessage')} onCancel={() => setConfirmDelete(false)} onConfirm={() => void removeIncome()} title={t('incomes.deleteTitle')} visible={confirmDelete} />
    </>
  );
}

function PaymentCard({ payment, onEdit, onDelete }: { payment: Payment; onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  return (
    <SimpleCard style={[styles.details, { gap: theme.spacing.md }]}> 
      <AppText variant="heading" weight="bold">{formatCurrency(payment.amount, language)}</AppText>
      <AppText color="secondary">{formatDate(payment.date, language)}</AppText>
      {payment.notes ? <AppText>{payment.notes}</AppText> : null}
      <LargeButton icon="edit-2" onPress={onEdit} title={t('common.edit')} variant="secondary" />
      <LargeButton icon="trash-2" onPress={onDelete} title={t('common.delete')} variant="danger" />
    </SimpleCard>
  );
}

const styles = StyleSheet.create({
  details: { width: '100%' },
  actions: { width: '100%' },
  payments: { width: '100%' },
  center: { textAlign: 'center' },
});
