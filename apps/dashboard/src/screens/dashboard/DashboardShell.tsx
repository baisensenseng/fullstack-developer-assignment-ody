import { AppSidebar, colors, layout, spacing, typography, useToast } from '@ody/shared';
import { dashboardRoutes } from '@ody/types';
import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import customersIcon from '../../../assets/sidebar/customers.svg';
import helpIcon from '../../../assets/sidebar/help.svg';
import homeIcon from '../../../assets/sidebar/home.svg';
import humanIcon from '../../../assets/sidebar/human.svg';
import menuIcon from '../../../assets/sidebar/menu.svg';
import messagesIcon from '../../../assets/sidebar/messages.svg';
import notificationsIcon from '../../../assets/sidebar/notifications.svg';
import ordersIcon from '../../../assets/sidebar/orders.svg';
import searchIcon from '../../../assets/sidebar/search.svg';
import settingsIcon from '../../../assets/sidebar/settings.svg';
import uiLibraryIcon from '../../../assets/sidebar/ui-library.svg';
import { useAuthSession } from '../auth/use-auth-session';
import { CrmScreen } from './CrmScreen';
import { HomeScreen } from './HomeScreen';
import { MenuScreen } from './MenuScreen';
import { OrdersScreen } from './OrdersScreen';
import { SettingsScreen } from './SettingsScreen';
import { UiLibraryScreen } from './UiLibraryScreen';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

const navItems = [
  { key: 'home', label: 'Home', href: dashboardRoutes.home, icon: homeIcon },
  { key: 'orders', label: 'Orders', href: dashboardRoutes.orders, icon: ordersIcon },
  { key: 'menu', label: 'Menu', href: dashboardRoutes.menu, icon: menuIcon },
  { key: 'crm', label: 'CRM', href: dashboardRoutes.crm, icon: customersIcon },
  { key: 'settings', label: 'Settings', href: dashboardRoutes.settings, icon: settingsIcon },
  { key: 'ui-library', label: 'UI Library', href: dashboardRoutes.uiLibrary, icon: uiLibraryIcon }
] as const;

/**
 * Description: Implements LogoutButton.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? colors.palette.gray200 : colors.background.muted
        },
        pointerStyle
      ]}
    >
      <Text style={{ color: colors.text.primary, fontSize: typography.button.fontSize, fontWeight: '800' }}>Logout</Text>
    </Pressable>
  );
}

/**
 * Description: Implements DashboardShell.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function DashboardShell() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuthSession();
  const { showToast } = useToast();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) router.replace('/login');
  }, [auth.isAuthenticated, auth.isLoading, router]);

  if (auth.isLoading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  if (!auth.isAuthenticated) return null;

  const isHome = pathname === dashboardRoutes.home;
  const isOrders = pathname === dashboardRoutes.orders;
  const isMenu = pathname === dashboardRoutes.menu;
  const isCrm = pathname === dashboardRoutes.crm;
  const isSettings = pathname === dashboardRoutes.settings;
  const isUiLibrary = pathname === dashboardRoutes.uiLibrary;

  return (
    <View style={{ flex: 1, minHeight: '100%', flexDirection: 'row', backgroundColor: colors.background.page }}>
      <AppSidebar
        businessName="Ody Bistro"
        planLabel="Restaurant Ops · See Plans"
        businessIcon={humanIcon}
        searchIcon={searchIcon}
        navItems={navItems.map((item) => ({
          key: item.key,
          label: item.label,
          icon: item.icon,
          active: pathname === item.href,
          onPress: () => router.push(item.href)
        }))}
        footerIcons={[
          {
            key: 'notifications',
            label: 'Notifications',
            icon: notificationsIcon,
            panel: {
              title: 'Notifications',
              description: 'Operational updates that need attention.',
              emptyText: 'No new notifications.',
              items: [
                { key: 'new-order', title: 'New order waiting', description: 'Order ODY-1027 needs acceptance from the kitchen.', meta: '2m' },
                { key: 'menu-alert', title: 'Menu availability changed', description: 'Margherita Pizza was marked unavailable.', meta: '18m' },
                { key: 'prep-time', title: 'Prep time updated', description: 'Quoted kitchen timing changed to 24 minutes.', meta: '1h' }
              ]
            }
          },
          {
            key: 'messages',
            label: 'Messages',
            icon: messagesIcon,
            panel: {
              title: 'Messages',
              description: 'Customer and staff messages for today.',
              emptyText: 'No unread messages.',
              items: [
                { key: 'customer-question', title: 'Maya Chen', description: 'Can I pick up my order 10 minutes later?', meta: '4m' },
                { key: 'staff-note', title: 'Kitchen team', description: 'Low stock on basil after the dinner rush.', meta: '31m' }
              ]
            }
          },
          {
            key: 'help',
            label: 'Help',
            icon: helpIcon,
            panel: {
              title: 'Help',
              description: 'Quick support links for daily operations.',
              items: [
                { key: 'help-center', title: 'Help center', description: 'Browse dashboard setup and workflow guides.', onPress: () => showToast({ title: 'Help center', message: 'Help center content is included in the local assignment scope.', tone: 'info' }) },
                { key: 'shortcuts', title: 'Keyboard shortcuts', description: 'View common actions for orders, menu, and CRM.', onPress: () => showToast({ title: 'Shortcuts', message: 'Use search, filters, and action buttons to move through daily workflows.', tone: 'info' }) },
                { key: 'support', title: 'Contact support', description: 'Send an issue report to the operations team.', onPress: () => showToast({ title: 'Support request queued', message: 'A demo support request was prepared for the reviewer flow.', tone: 'success' }) }
              ]
            }
          }
        ]}
        bottomAction={<LogoutButton onPress={auth.logout} />}
      />

      {isOrders || isMenu || isCrm || isSettings ? (
        <View style={{ flex: 1, paddingHorizontal: layout.contentPadding, paddingVertical: layout.contentPadding }}>
          <View style={{ width: '100%', maxWidth: layout.pageMaxWidth, flex: 1 }}>
            {isOrders ? <OrdersScreen /> : isMenu ? <MenuScreen /> : isCrm ? <CrmScreen /> : <SettingsScreen />}
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: layout.contentPadding, paddingVertical: layout.contentPadding }}>
          <View style={{ width: '100%', maxWidth: layout.pageMaxWidth }}>
            {isHome ? <HomeScreen /> : isUiLibrary ? <UiLibraryScreen /> : (
              <View style={{ borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: 20, backgroundColor: colors.background.elevated, padding: 28 }}>
                <Text style={{ fontSize: typography.sectionTitle.fontSize, fontWeight: '800', color: colors.text.primary }}>Coming next</Text>
                <Text style={{ marginTop: 12, color: colors.text.secondary, lineHeight: typography.body.lineHeight }}>This section will use the same contract-first flow and shared design tokens.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
