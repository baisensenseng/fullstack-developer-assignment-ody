import { useState, type ReactNode } from 'react';
import { Image, Modal, Platform, Pressable, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { colors, componentTokens, radius, spacing, typography } from '../tokens';

export type SidebarNavItem = {
  key: string;
  label: string;
  icon: number;
  active?: boolean;
  onPress?: () => void;
};

export type SidebarFooterPanelItem = {
  key: string;
  title: string;
  description?: string;
  meta?: string;
  onPress?: () => void;
};

export type SidebarFooterPanel = {
  title: string;
  description?: string;
  emptyText?: string;
  items?: SidebarFooterPanelItem[];
};

export type SidebarFooterIcon = {
  key: string;
  icon: number;
  label: string;
  onPress?: () => void;
  panel?: SidebarFooterPanel;
};

export type AppSidebarProps = {
  businessName: string;
  planLabel: string;
  businessIcon: number;
  navItems: SidebarNavItem[];
  searchIcon: number;
  footerIcons?: SidebarFooterIcon[];
  bottomAction?: ReactNode;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : undefined;
const textInputPointerStyle = Platform.OS === 'web' ? ({ cursor: 'text', outlineStyle: 'solid', outlineWidth: 0 } as unknown as TextStyle) : undefined;

/**
 * Description: Implements SidebarNavButton.
 * Parameters: item SidebarNavItem navigation entry with icon, label, active state, and press handler.
 * Returns: JSX sidebar navigation button.
 */
function SidebarNavButton({ item }: { item: SidebarNavItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={item.onPress}
      style={({ pressed }) => [
        {
          minHeight: componentTokens.sidebar.itemHeight,
          borderRadius: componentTokens.sidebar.itemRadius,
          flexDirection: 'row',
          alignItems: 'center',
          gap: componentTokens.sidebar.itemGap,
          paddingHorizontal: componentTokens.sidebar.itemPaddingHorizontal,
          backgroundColor: item.active ? componentTokens.sidebar.activeBackground : hovered || pressed ? componentTokens.sidebar.hoverBackground : 'transparent'
        },
        pointerStyle
      ]}
    >
      <Image source={item.icon} style={{ width: componentTokens.sidebar.iconSize, height: componentTokens.sidebar.iconSize }} resizeMode="contain" />
      <Text style={{ color: colors.text.primary, fontSize: typography.body.fontSize, fontWeight: item.active ? '800' : '700' }}>{item.label}</Text>
    </Pressable>
  );
}

/**
 * Description: Implements SidebarNavList.
 * Parameters: items SidebarNavItem[] navigation entries, style optional ViewStyle wrapper override.
 * Returns: JSX sidebar navigation list.
 */
export function SidebarNavList({ items, style }: { items: SidebarNavItem[]; style?: ViewStyle }) {
  return (
    <View style={[{ gap: 4 }, style]}>
      {items.map((item) => <SidebarNavButton key={item.key} item={item} />)}
    </View>
  );
}

/**
 * Description: Implements SidebarFooterPanelView.
 * Parameters: panel SidebarFooterPanel content, onClose function close handler.
 * Returns: JSX sidebar footer popover panel.
 */
function SidebarFooterPanelView({ onClose, panel }: { panel: SidebarFooterPanel; onClose: () => void }) {
  const items = panel.items ?? [];

  return (
    <View style={{ width: 300, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.lg, backgroundColor: colors.background.elevated, shadowColor: colors.palette.black, shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, overflow: 'hidden' }}>
      <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>{panel.title}</Text>
            {panel.description ? <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight }}>{panel.description}</Text> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close panel" onPress={onClose} style={[{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
            <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: '900' }}>×</Text>
          </Pressable>
        </View>
      </View>

      {items.length ? (
        <View>
          {items.map((item) => (
            <Pressable key={item.key} accessibilityRole={item.onPress ? 'button' : undefined} onPress={item.onPress ? () => { item.onPress?.(); onClose(); } : undefined} style={({ pressed }) => [{ minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: pressed ? colors.background.muted : colors.background.elevated }, item.onPress ? pointerStyle : undefined]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{item.title}</Text>
                  {item.description ? <Text style={{ marginTop: 3, color: colors.text.secondary, fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight }}>{item.description}</Text> : null}
                </View>
                {item.meta ? <Text style={{ color: colors.text.muted, fontSize: typography.caption.fontSize, fontWeight: '700' }}>{item.meta}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize, textAlign: 'center' }}>{panel.emptyText ?? 'Nothing to show right now.'}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Description: Implements FooterIconButton.
 * Parameters: icon number image source, label string accessible label, active boolean selected state, onPress function click handler.
 * Returns: JSX footer icon button.
 */
function FooterIconButton({ active, icon, label, onPress }: { active?: boolean; icon: number; label: string; onPress?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={[
        {
          width: componentTokens.sidebar.footerIconSize,
          height: componentTokens.sidebar.footerIconSize,
          borderRadius: componentTokens.sidebar.footerIconSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active || hovered ? componentTokens.sidebar.hoverBackground : 'transparent'
        },
        pointerStyle
      ]}
    >
      {hovered ? (
        <View style={{ position: 'absolute', bottom: 42, borderRadius: radius.sm, backgroundColor: colors.background.inverse, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: colors.text.inverse, fontSize: typography.label.fontSize, fontWeight: '700' }}>{label}</Text>
        </View>
      ) : null}
      <Image source={icon} style={{ width: componentTokens.sidebar.footerIconGlyphSize, height: componentTokens.sidebar.footerIconGlyphSize }} resizeMode="contain" />
    </Pressable>
  );
}

/**
 * Description: Implements AppSidebar.
 * Parameters: props AppSidebarProps brand, navigation, search, footer tools, and bottom action.
 * Returns: JSX full application sidebar shell.
 */
export function AppSidebar({ businessIcon, businessName, bottomAction, footerIcons = [], navItems, planLabel, searchIcon }: AppSidebarProps) {
  const [searchHovered, setSearchHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFooterKey, setActiveFooterKey] = useState<string | null>(null);
  const activeFooter = footerIcons.find((item) => item.key === activeFooterKey);

  /**
   * Description: Implements handleFooterPress.
   * Parameters: item SidebarFooterIcon selected footer tool.
   * Returns: void after opening a panel or invoking the item action.
   */
  function handleFooterPress(item: SidebarFooterIcon) {
    if (item.panel) {
      setActiveFooterKey((current) => current === item.key ? null : item.key);
      return;
    }
    item.onPress?.();
  }

  return (
    <View style={{ width: componentTokens.sidebar.width, minHeight: '100%', borderRightWidth: 1, borderRightColor: componentTokens.sidebar.borderColor, backgroundColor: colors.background.sidebar, justifyContent: 'space-between' }}>
      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        <View style={{ width: componentTokens.sidebar.businessCardWidth, minHeight: componentTokens.sidebar.businessCardMinHeight, borderWidth: 1, borderColor: colors.borderColor.default, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={businessIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
          <View>
            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '800' }}>{businessName}</Text>
            <View style={{ alignSelf: 'flex-start', marginTop: 5, borderRadius: componentTokens.badge.borderRadius, backgroundColor: colors.status.infoBg, paddingHorizontal: componentTokens.badge.paddingHorizontal, paddingVertical: componentTokens.badge.paddingVertical }}>
              <Text style={{ color: colors.text.primary, fontSize: componentTokens.badge.fontSize }}>{planLabel}</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="search"
          onHoverIn={() => setSearchHovered(true)}
          onHoverOut={() => setSearchHovered(false)}
          style={[
            {
              marginTop: 28,
              minHeight: componentTokens.sidebar.searchHeight,
              borderWidth: 1,
              borderColor: searchHovered || searchFocused ? colors.borderColor.focus : colors.borderColor.default,
              borderRadius: radius.pill,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 14,
              backgroundColor: colors.background.elevated
            },
            pointerStyle
          ]}
        >
          <Image source={searchIcon} style={{ width: componentTokens.sidebar.searchIconSize, height: componentTokens.sidebar.searchIconSize }} resizeMode="contain" />
          <TextInput
            onBlur={() => setSearchFocused(false)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search"
            placeholderTextColor={colors.text.secondary}
            style={[{ flex: 1, minHeight: 38, padding: 0, color: colors.text.primary, fontSize: typography.body.fontSize }, textInputPointerStyle]}
          />
        </Pressable>

        <SidebarNavList items={navItems} style={{ marginTop: 16 }} />
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: componentTokens.sidebar.borderColor, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
        {footerIcons.length ? (
          <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
            {footerIcons.map((item) => <FooterIconButton key={item.key} active={activeFooterKey === item.key} icon={item.icon} label={item.label} onPress={() => handleFooterPress(item)} />)}
          </View>
        ) : null}
        {bottomAction}
      </View>

      <Modal visible={Boolean(activeFooter?.panel)} transparent animationType="fade" onRequestClose={() => setActiveFooterKey(null)}>
        <View style={{ flex: 1 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close sidebar panel" onPress={() => setActiveFooterKey(null)} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
          <View style={{ position: 'absolute', left: 16, bottom: 108 }}>
            {activeFooter?.panel ? <SidebarFooterPanelView panel={activeFooter.panel} onClose={() => setActiveFooterKey(null)} /> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
