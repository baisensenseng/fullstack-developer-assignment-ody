import { useGetSettings, useUpdateSettings, type GetSettings200Settings } from '@ody/api-client';
import { Button, colors, ErrorStateCard, LoadingStateCard, MetricCard, SelectPill, spacing, SurfaceCard, SurfaceHeader, TextField, ToggleRow, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { OpeningHoursEditor } from './settings/SettingsControls';
import { cloneSettings, currencyOptions, formatUpdatedAt, getSettingsData, getSettingsErrorMessage, isDirtySettings, timezoneOptions, type CurrencyOption, type TimezoneOption } from './settings/settings-formatters';

/**
 * Description: Implements SettingsScreen.
 * Parameters: none.
 * Returns: JSX settings management screen.
 */
export function SettingsScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const settingsQuery = useGetSettings({ query: { placeholderData: (previousData) => previousData } });
  const data = getSettingsData(settingsQuery.data);
  const savedSettings = data?.settings ?? null;
  const [settings, setSettings] = useState<GetSettings200Settings | null>(null);
  const [saveError, setSaveError] = useState('');
  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: async (response) => {
        setSaveError('');
        if (response.status === 200) {
          setSettings(cloneSettings(response.data.settings));
          showToast({ title: 'Settings saved', message: 'Restaurant settings were updated.', tone: 'success' });
        }
        await queryClient.invalidateQueries({ queryKey: ['/settings'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
      },
      onError: (error) => {
        const message = getSettingsErrorMessage(error);
        setSaveError(message);
        showToast({ title: 'Settings not saved', message, tone: 'error' });
      }
    }
  });

  useEffect(() => {
    if (savedSettings && !settings) setSettings(cloneSettings(savedSettings));
  }, [savedSettings, settings]);

  const dirty = useMemo(() => isDirtySettings(settings, savedSettings), [settings, savedSettings]);

  /**
   * Description: Implements updateSetting.
   * Parameters: key keyof GetSettings200Settings setting key, value GetSettings200Settings value.
   * Returns: void after updating local form state.
   */
  function updateSetting<TKey extends keyof GetSettings200Settings>(key: TKey, value: GetSettings200Settings[TKey]) {
    setSettings((current) => current ? { ...current, [key]: value } : current);
  }

  /**
   * Description: Implements resetSettings.
   * Parameters: none.
   * Returns: void after resetting local form state from persisted settings.
   */
  function resetSettings() {
    if (savedSettings) setSettings(cloneSettings(savedSettings));
    setSaveError('');
    showToast({ title: 'Changes reset', message: 'Unsaved settings were reverted.', tone: 'info' });
  }

  /**
   * Description: Implements saveSettings.
   * Parameters: none.
   * Returns: void after dispatching settings update mutation.
   */
  function saveSettings() {
    if (!settings) return;
    updateMutation.mutate({ data: {
      serviceAvailable: settings.serviceAvailable,
      autoAccept: settings.autoAccept,
      prepTimeMinutes: settings.prepTimeMinutes,
      businessName: settings.businessName,
      timezone: settings.timezone,
      currency: settings.currency,
      openingHours: settings.openingHours,
      newOrderAlerts: settings.newOrderAlerts,
      lowStockAlerts: settings.lowStockAlerts,
      dailyDigest: settings.dailyDigest
    } });
  }

  if (settingsQuery.isLoading && !savedSettings) return <LoadingStateCard label="Loading settings" />;
  if (settingsQuery.isError || !settings || !savedSettings) return <ErrorStateCard title="Could not load settings" description="Refresh restaurant settings and try again." onRetry={() => void settingsQuery.refetch()} />;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg }}>
        <View>
          <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>Settings</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Last saved {formatUpdatedAt(savedSettings.updatedAt)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ width: 128 }}><Button variant="secondary" disabled={!dirty || updateMutation.isPending} onPress={resetSettings}>Reset</Button></View>
          <View style={{ width: 150 }}><Button loading={updateMutation.isPending} disabled={!dirty} onPress={saveSettings}>Save changes</Button></View>
        </View>
      </View>

      {saveError ? <Text style={{ color: colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{saveError}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <MetricCard label="Ordering" value={settings.serviceAvailable ? 'Open' : 'Closed'} helper="Customer ordering status" />
        <MetricCard label="Acceptance" value={settings.autoAccept ? 'Auto' : 'Manual'} helper="New order workflow" />
        <MetricCard label="Prep time" value={`${settings.prepTimeMinutes} min`} helper="Quoted kitchen timing" />
        <MetricCard label="Hours" value={settings.openingHours.split(';')[0] ?? 'Configured'} helper="Opening hours" />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: spacing.lg }}>
          <SurfaceCard>
            <SurfaceHeader title="Ordering controls" caption="Manage when customers can place orders and how the kitchen receives them." />
            <View style={{ marginTop: spacing.lg }}>
              <ToggleRow label="Accept online orders" description="Turn customer ordering on or off for the restaurant." value={settings.serviceAvailable} onChange={(value) => updateSetting('serviceAvailable', value)} />
              <ToggleRow label="Auto-accept new orders" description="Send new orders directly into prep without manager approval." value={settings.autoAccept} onChange={(value) => updateSetting('autoAccept', value)} />
              <View style={{ paddingTop: spacing.lg }}>
                <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Default prep time</Text>
                <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.caption.fontSize }}>Used for customer quotes and kitchen planning.</Text>
                <View style={{ marginTop: spacing.md, width: 220 }}>
                  <TextField label="Minutes" keyboardType="numeric" value={String(settings.prepTimeMinutes)} onChangeText={(value) => updateSetting('prepTimeMinutes', Number.parseInt(value, 10) || 0)} />
                </View>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SurfaceHeader title="Opening hours" caption="Set customer-facing ordering hours for regular service." />
            <View style={{ marginTop: spacing.lg }}>
              <OpeningHoursEditor value={settings.openingHours} onChange={(value) => updateSetting('openingHours', value)} />
            </View>
          </SurfaceCard>
        </View>

        <View style={{ flex: 0.8, gap: spacing.lg }}>
          <SurfaceCard>
            <SurfaceHeader title="Notifications" caption="Choose which operational events should alert the team." />
            <View style={{ marginTop: spacing.lg }}>
              <ToggleRow label="New order alerts" description="Notify managers when an order enters the queue." value={settings.newOrderAlerts} onChange={(value) => updateSetting('newOrderAlerts', value)} />
              <ToggleRow label="Low stock alerts" description="Warn the team when menu availability needs attention." value={settings.lowStockAlerts} onChange={(value) => updateSetting('lowStockAlerts', value)} />
              <ToggleRow label="Daily digest" description="Send a daily operations summary after service." value={settings.dailyDigest} onChange={(value) => updateSetting('dailyDigest', value)} />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SurfaceHeader title="Restaurant profile" caption="Keep operational identity aligned across reports, orders, and exports." />
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <TextField label="Business name" value={settings.businessName} onChangeText={(value) => updateSetting('businessName', value)} />
              <View>
                <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Timezone</Text>
                <View style={{ marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {timezoneOptions.map((timezone) => <SelectPill key={timezone} label={timezone.replace('America/', '')} selected={settings.timezone === timezone} value={timezone} onSelect={(value: TimezoneOption) => updateSetting('timezone', value)} />)}
                </View>
              </View>
              <View>
                <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Currency</Text>
                <View style={{ marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {currencyOptions.map((currency) => <SelectPill key={currency} label={currency} selected={settings.currency === currency} value={currency} onSelect={(value: CurrencyOption) => updateSetting('currency', value)} />)}
                </View>
              </View>
            </View>
          </SurfaceCard>
        </View>
      </View>
    </ScrollView>
  );
}
