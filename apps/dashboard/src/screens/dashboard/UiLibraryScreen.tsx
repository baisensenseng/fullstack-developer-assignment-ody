import { Button, colors, componentStates, componentTokens, DrawerFrame, EmptyStateCard, ErrorStateCard, LoadingStateCard, MetricCard, ModalFrame, MultiSelectFilter, NavigationTabs, radius, SearchInput, SegmentedButton, SelectPill, SidebarNavList, spacing, StatusBadge, SurfaceCard, SurfaceHeader, TextField, ToastCard, ToggleRow, typography, useToast } from '@ody/shared';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import customersIcon from '../../../assets/sidebar/customers.svg';
import homeIcon from '../../../assets/sidebar/home.svg';
import menuIcon from '../../../assets/sidebar/menu.svg';
import ordersIcon from '../../../assets/sidebar/orders.svg';
import settingsIcon from '../../../assets/sidebar/settings.svg';
import uiLibraryIcon from '../../../assets/sidebar/ui-library.svg';

const colorGroups = [
  { label: 'Background', values: colors.background },
  { label: 'Text', values: colors.text },
  { label: 'Border', values: colors.borderColor },
  { label: 'Status', values: colors.status }
] as const;

const typographySamples = [
  { label: 'Page title', token: typography.pageTitle, sample: 'Restaurant operations' },
  { label: 'Section title', token: typography.sectionTitle, sample: 'Create order' },
  { label: 'Card title', token: typography.cardTitle, sample: 'Recent orders' },
  { label: 'Body', token: typography.body, sample: 'Track orders, customers, and menu availability.' },
  { label: 'Body strong', token: typography.bodyStrong, sample: 'Manual acceptance' },
  { label: 'Caption', token: typography.caption, sample: 'Updated 11:32 AM' }
] as const;

const spacingSamples = Object.entries(spacing);
const radiusSamples = Object.entries(radius);
const stateSamples = Object.entries(componentStates);

/**
 * Description: Implements TokenValue.
 * Parameters: label string token name, value string or number token value.
 * Returns: JSX token value row.
 */
function TokenValue({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ minHeight: 38, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
      <Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: colors.text.primary, fontFamily: typography.fontFamily.mono, fontSize: typography.caption.fontSize, fontWeight: '700' }}>{String(value)}</Text>
    </View>
  );
}

/**
 * Description: Implements ColorSwatch.
 * Parameters: name string token name, value string color value.
 * Returns: JSX color swatch row.
 */
function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={{ minWidth: 190, flex: 1, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.md, backgroundColor: colors.background.elevated, overflow: 'hidden' }}>
      <View style={{ height: 56, backgroundColor: value, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle }} />
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{name}</Text>
        <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontFamily: typography.fontFamily.mono, fontSize: typography.caption.fontSize }}>{value}</Text>
      </View>
    </View>
  );
}

/**
 * Description: Implements ComponentPreview.
 * Parameters: title string preview title, caption string optional description, children React node preview content.
 * Returns: JSX preview card section.
 */
function ComponentPreview({ caption, children, elevated = false, title }: { caption?: string; children: React.ReactNode; elevated?: boolean; title: string }) {
  return (
    <SurfaceCard style={{ position: 'relative', zIndex: elevated ? 50 : 1 }}>
      <SurfaceHeader title={title} caption={caption} />
      <View style={{ marginTop: spacing.lg }}>{children}</View>
    </SurfaceCard>
  );
}

/**
 * Description: Implements UiLibraryScreen.
 * Parameters: none.
 * Returns: JSX UI library screen.
 */
export function UiLibraryScreen() {
  const [search, setSearch] = useState('');
  const [activeSegment, setActiveSegment] = useState('Default');
  const [activeTab, setActiveTab] = useState('all');
  const [toggleValue, setToggleValue] = useState(false);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Array<'dashboard' | 'phone'>>(['dashboard']);
  const [selectedPill, setSelectedPill] = useState('USD');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();
  const stateNames = useMemo(() => ['Default', 'Focus', 'Active'], []);

  /**
   * Description: Implements toggleChannel.
   * Parameters: value selected channel value.
   * Returns: void after toggling selected channel state.
   */
  function toggleChannel(value: 'dashboard' | 'phone') {
    setSelectedChannels((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }


  return (
    <View style={{ gap: spacing.xl }}>
      <DrawerFrame visible={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SurfaceHeader title="Reusable drawer" caption="This frame is shared by detail panels and side workflows." />
        <View style={{ marginTop: spacing.lg, width: 160 }}><Button onPress={() => setDrawerOpen(false)}>Close</Button></View>
      </DrawerFrame>

      <ModalFrame visible={modalOpen} onClose={() => setModalOpen(false)} contentStyle={{ maxWidth: 520 }}>
        <SurfaceHeader title="Reusable modal" caption="This frame is shared by workflows that need focused dialog content." />
        <View style={{ marginTop: spacing.lg, width: 160 }}><Button onPress={() => setModalOpen(false)}>Close</Button></View>
      </ModalFrame>

      <View>
        <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>UI Library</Text>
        <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight }}>Reusable tokens, primitives, and component states used across the restaurant dashboard.</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <MetricCard label="Components" value="10" helper="Shared primitives" />
        <MetricCard label="States" value="8" helper="Default to warning" />
        <MetricCard label="Tokens" value="6" helper="Color, type, space" />
        <MetricCard label="Surfaces" value="3" helper="Cards, data, dialogs" />
      </View>

      <SurfaceCard>
        <SurfaceHeader title="Design tokens" caption="Foundations are grouped by semantic purpose instead of hardcoded values." />
        <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
          {colorGroups.map((group) => (
            <View key={group.label}>
              <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{group.label}</Text>
              <View style={{ marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                {Object.entries(group.values).map(([name, value]) => <ColorSwatch key={`${group.label}-${name}`} name={name} value={value} />)}
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.lg }}>
        <SurfaceCard style={{ flex: 1 }}>
          <SurfaceHeader title="Typography" caption="Type styles map directly to token roles." />
          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {typographySamples.map((item) => (
              <View key={item.label} style={{ borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, paddingBottom: spacing.md }}>
                <Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '700' }}>{item.label}</Text>
                <Text style={{ marginTop: spacing.xs, color: colors.text.primary, fontSize: item.token.fontSize, lineHeight: item.token.lineHeight, fontWeight: item.token.fontWeight }}>{item.sample}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>

        <SurfaceCard style={{ flex: 1 }}>
          <SurfaceHeader title="Spacing and radius" caption="Layout primitives use shared scale values." />
          <View style={{ marginTop: spacing.lg, flexDirection: 'row', gap: spacing.xl }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Spacing</Text>
              <View style={{ marginTop: spacing.sm }}>
                {spacingSamples.map(([name, value]) => <TokenValue key={name} label={name} value={`${value}px`} />)}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Radius</Text>
              <View style={{ marginTop: spacing.sm }}>
                {radiusSamples.map(([name, value]) => <TokenValue key={name} label={name} value={name === 'pill' ? '999px' : `${value}px`} />)}
              </View>
            </View>
          </View>
        </SurfaceCard>
      </View>


      <SurfaceCard>
        <SurfaceHeader title="Component states" caption="Shared semantic states cover interaction, validation, loading, and feedback." />
        <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {stateSamples.map(([name, value]) => (
            <View key={name} style={{ minWidth: 180, flex: 1, borderWidth: 1, borderColor: value.borderColor, borderRadius: radius.md, backgroundColor: value.backgroundColor, padding: spacing.md }}>
              <Text style={{ color: value.textColor, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textTransform: 'capitalize' }}>{name}</Text>
              <Text style={{ marginTop: spacing.xs, color: value.textColor, fontSize: typography.caption.fontSize }}>{value.borderColor}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
        <View style={{ flex: 1, minWidth: 420, gap: spacing.lg }}>
          <ComponentPreview title="Buttons" caption="Primary, secondary, disabled, and loading states.">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              <View style={{ width: 150 }}><Button>Primary</Button></View>
              <View style={{ width: 150 }}><Button variant="secondary">Secondary</Button></View>
              <View style={{ width: 150 }}><Button disabled>Disabled</Button></View>
              <View style={{ width: 150 }}><Button loading>Loading</Button></View>
            </View>
          </ComponentPreview>

          <ComponentPreview title="Inputs" caption="Floating labels, search, error, and disabled controls.">
            <View style={{ gap: spacing.md }}>
              <TextField label="Business name" value="Ody Bistro" onChangeText={() => undefined} />
              <TextField label="Email" hasError value="ops@ody.local" onChangeText={() => undefined} />
              <TextField label="Disabled" editable={false} value="Read only" onChangeText={() => undefined} />
              <SearchInput value={search} placeholder="Search components" onChangeText={setSearch} onClear={() => setSearch('')} />
            </View>
          </ComponentPreview>
        </View>

        <View style={{ flex: 1, minWidth: 420, gap: spacing.lg }}>
          <ComponentPreview elevated title="Selection controls" caption="Segmented controls and switch rows use shared interaction styles.">
            <View style={{ gap: spacing.lg }}>
              <View style={{ gap: spacing.lg, position: 'relative', zIndex: openFilterId ? 20 : 2 }}>
                <NavigationTabs items={[{ label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Ready', value: 'ready' }]} value={activeTab} onChange={setActiveTab} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {stateNames.map((name) => <SegmentedButton key={name} active={activeSegment === name} label={name} onPress={() => setActiveSegment(name)} />)}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {['USD', 'CAD', 'EUR'].map((currency) => <SelectPill key={currency} label={currency} value={currency} selected={selectedPill === currency} onSelect={setSelectedPill} />)}
                </View>
                <MultiSelectFilter
                  id="channels"
                  label="Channels"
                  options={[{ label: 'Dashboard', value: 'dashboard' }, { label: 'Phone', value: 'phone' }]}
                  selectedValues={selectedChannels}
                  openId={openFilterId}
                  setOpenId={setOpenFilterId}
                  onToggle={toggleChannel}
                  onSelectAll={() => setSelectedChannels(selectedChannels.length === 2 ? [] : ['dashboard', 'phone'])}
                />
              </View>
              <View style={{ position: 'relative', zIndex: 1 }}>
                <ToggleRow label="Auto-accept new orders" description="Send new orders directly into prep." value={toggleValue} onChange={setToggleValue} />
              </View>
            </View>
          </ComponentPreview>

          <ComponentPreview title="Badges" caption="Status badges use semantic tones.">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <StatusBadge label="Success" tone="success" />
              <StatusBadge label="Warning" tone="warning" />
              <StatusBadge label="Error" tone="error" />
              <StatusBadge label="Info" tone="info" />
            </View>
          </ComponentPreview>


          <ComponentPreview title="Metric cards" caption="Operational KPIs use icon, value, and helper text slots.">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              <MetricCard label="Orders" value="128" helper="Today" />
              <MetricCard label="Revenue" value="$4,812" helper="Net sales" />
            </View>
          </ComponentPreview>
        </View>
      </View>


      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.lg }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <ComponentPreview title="Sidebar navigation" caption="The reusable navigation list is separate from the application sidebar shell, header, search, footer tools, and logout action.">
            <View style={{ width: '100%', borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.lg, backgroundColor: colors.background.sidebar, padding: spacing.md }}>
              <SidebarNavList
                items={[
                  { key: 'home', label: 'Home', icon: homeIcon, active: true, onPress: () => undefined },
                  { key: 'orders', label: 'Orders', icon: ordersIcon, onPress: () => undefined },
                  { key: 'menu', label: 'Menu', icon: menuIcon, onPress: () => undefined },
                  { key: 'crm', label: 'CRM', icon: customersIcon, onPress: () => undefined },
                  { key: 'settings', label: 'Settings', icon: settingsIcon, onPress: () => undefined },
                  { key: 'ui-library', label: 'UI Library', icon: uiLibraryIcon, onPress: () => undefined }
                ]}
              />
            </View>
          </ComponentPreview>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <ComponentPreview title="Dialogs and feedback" caption="Modal frames and toast cards provide reusable feedback patterns.">
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <View style={{ width: 170 }}><Button variant="secondary" onPress={() => setModalOpen(true)}>Open modal</Button></View>
                <View style={{ width: 170 }}><Button variant="secondary" onPress={() => setDrawerOpen(true)}>Open drawer</Button></View>
              </View>
              <View style={{ width: 170 }}><Button variant="secondary" onPress={() => showToast({ title: 'Toast created', message: 'Global toast feedback is available across dashboard workflows.', tone: 'success' })}>Show toast</Button></View>
              <ToastCard tone="success" title="Saved" message="Restaurant settings were updated." />
              <ToastCard tone="warning" title="Review needed" message="Some menu items are unavailable for ordering." />
              <ToastCard tone="error" title="Action failed" message="This order action is not valid for the current status." />
            </View>
          </ComponentPreview>
        </View>
      </View>

      <SurfaceCard>
        <SurfaceHeader title="Feedback states" caption="Empty, loading, and error states use reusable state cards." />
        <View style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'stretch', gap: spacing.lg }}>
          <View style={{ flex: 1 }}><EmptyStateCard icon="orders" title="No orders found" description="Create an order to populate this list." /></View>
          <View style={{ flex: 1 }}><LoadingStateCard label="Loading restaurant activity" /></View>
          <View style={{ flex: 1 }}><ErrorStateCard title="Could not load data" description="Refresh the page and try again." onRetry={() => undefined} /></View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SurfaceHeader title="Component token snapshot" caption="Common component dimensions stay centralized in shared tokens." />
        <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl }}>
          <View style={{ minWidth: 240, flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Button</Text>
            <View style={{ marginTop: spacing.sm }}>
              <TokenValue label="height" value={`${componentTokens.button.minHeight}px`} />
              <TokenValue label="radius" value="pill" />
              <TokenValue label="padding" value={`${componentTokens.button.paddingHorizontal}px`} />
            </View>
          </View>
          <View style={{ minWidth: 240, flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Card</Text>
            <View style={{ marginTop: spacing.sm }}>
              <TokenValue label="padding" value={`${componentTokens.card.padding}px`} />
              <TokenValue label="radius" value={`${componentTokens.card.borderRadius}px`} />
              <TokenValue label="border" value={`${componentTokens.card.borderWidth}px`} />
            </View>
          </View>
          <View style={{ minWidth: 240, flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Metric card</Text>
            <View style={{ marginTop: spacing.sm }}>
              <TokenValue label="icon" value={`${componentTokens.metricCard.iconSize}px`} />
              <TokenValue label="glyph" value={`${componentTokens.metricCard.iconGlyphSize}px`} />
              <TokenValue label="gap" value={`${componentTokens.metricCard.contentGap}px`} />
            </View>
          </View>
        </View>
      </SurfaceCard>
    </View>
  );
}
