const palette = {
  white: '#ffffff',
  black: '#000000',
  ink: '#101010',
  charcoal: '#1a1a1a',
  gray900: '#232323',
  gray700: '#595959',
  gray600: '#666666',
  gray500: '#878787',
  gray400: '#9b9b9b',
  gray300: '#cccccc',
  gray200: '#e8e8e8',
  gray150: '#eeeeee',
  gray100: '#f5f5f5',
  gray075: '#f7f7f7',
  gray050: '#fafafa',
  blue700: '#005ad9',
  blue100: '#e6f0ff',
  green700: '#007d2a',
  green100: '#e6ffea',
  amber800: '#876500',
  amber100: '#fff9e5',
  red700: '#b2001e',
  red100: '#ffe5ea'
} as const;

export const colors = {
  white: palette.white,
  black: palette.black,
  ink: palette.ink,
  muted: palette.gray700,
  surface: palette.white,
  surfaceMuted: palette.gray100,
  border: palette.gray200,
  brand: palette.ink,
  success: palette.green700,
  warning: palette.amber800,
  error: palette.red700,
  palette,
  background: {
    page: palette.white,
    app: palette.white,
    sidebar: palette.white,
    elevated: palette.white,
    muted: palette.gray100,
    subtle: palette.gray075,
    inverse: palette.ink
  },
  text: {
    primary: palette.ink,
    secondary: palette.gray700,
    muted: palette.gray500,
    subtle: palette.gray400,
    inverse: palette.white,
    success: palette.green700,
    warning: palette.amber800,
    error: palette.red700,
    info: palette.blue700
  },
  borderColor: {
    default: palette.gray200,
    subtle: palette.gray150,
    strong: palette.gray300,
    focus: palette.black,
    inverse: palette.ink,
    success: palette.green700,
    warning: palette.amber800,
    error: palette.red700,
    info: palette.blue700
  },
  action: {
    primary: palette.ink,
    primaryText: palette.white,
    secondary: palette.gray100,
    secondaryText: palette.ink,
    disabled: palette.gray200,
    disabledText: palette.gray500
  },
  status: {
    success: palette.green700,
    successBg: palette.green100,
    warning: palette.amber800,
    warningBg: palette.amber100,
    error: palette.red700,
    errorBg: palette.red100,
    info: palette.blue700,
    infoBg: palette.blue100
  }
} as const;

export const typography = {
  fontFamily: {
    display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700'
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400'
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600'
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500'
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700'
  },
  metric: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700'
  }
} as const;

export const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999
} as const;

export const borders = {
  hairline: 1,
  focus: 1.5,
  strong: 2
} as const;

export const shadows = {
  none: 'none',
  card: '0 12px 28px rgba(16, 16, 16, 0.06)',
  floating: '0 18px 48px rgba(16, 16, 16, 0.12)',
  tooltip: '0 10px 30px rgba(16, 16, 16, 0.18)'
} as const;

export const layout = {
  sidebarWidth: 280,
  pageMaxWidth: 9999,
  contentPadding: 28,
  cardPadding: 24,
  controlHeight: 48,
  compactControlHeight: 38,
  sidebarItemHeight: 48,
  tableRowHeight: 56
} as const;

export const componentTokens = {
  button: {
    minHeight: layout.controlHeight,
    compactHeight: layout.compactControlHeight,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight
  },
  input: {
    minHeight: 64,
    innerHeight: 62,
    borderWidth: borders.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    labelTop: 9,
    labelRestTop: 21,
    labelSize: typography.label.fontSize,
    labelRestSize: 16
  },
  card: {
    padding: layout.cardPadding,
    borderWidth: borders.hairline,
    borderRadius: radius.lg,
    borderColor: colors.borderColor.subtle,
    backgroundColor: colors.background.elevated
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  sidebar: {
    width: layout.sidebarWidth,
    borderColor: colors.borderColor.subtle,
    businessCardWidth: 248,
    businessCardMinHeight: 64,
    itemHeight: layout.sidebarItemHeight,
    itemRadius: radius.xs,
    itemGap: 14,
    itemPaddingHorizontal: 12,
    activeBackground: colors.background.muted,
    hoverBackground: colors.background.muted,
    iconSize: 22,
    footerIconSize: 36,
    footerIconGlyphSize: 18,
    searchHeight: 40,
    searchIconSize: 20
  },
  data: {
    metricFontSize: typography.metric.fontSize,
    metricLineHeight: typography.metric.lineHeight,
    rowHeight: layout.tableRowHeight,
    dividerColor: colors.borderColor.subtle,
    numericFontFamily: typography.fontFamily.mono
  },
  navigationTab: {
    fontSize: 15,
    activeFontWeight: '700',
    inactiveFontWeight: '600',
    paddingBottom: 10,
    indicatorWidth: 2
  },
  metricCard: {
    iconSize: 36,
    iconRadius: radius.pill,
    iconBackground: colors.background.muted,
    iconGlyphSize: 22,
    iconStrokeWidth: 2,
    contentGap: spacing.md
  }
} as const;

export const componentStates = {
  default: {
    borderColor: colors.borderColor.default,
    backgroundColor: colors.background.elevated,
    textColor: colors.text.primary
  },
  focus: {
    borderColor: colors.borderColor.focus,
    backgroundColor: colors.background.elevated,
    textColor: colors.text.primary
  },
  active: {
    borderColor: colors.borderColor.inverse,
    backgroundColor: colors.background.muted,
    textColor: colors.text.primary
  },
  disabled: {
    borderColor: colors.borderColor.default,
    backgroundColor: colors.action.disabled,
    textColor: colors.action.disabledText
  },
  loading: {
    borderColor: colors.borderColor.subtle,
    backgroundColor: colors.background.subtle,
    textColor: colors.text.muted
  },
  error: {
    borderColor: colors.borderColor.error,
    backgroundColor: colors.status.errorBg,
    textColor: colors.text.error
  },
  success: {
    borderColor: colors.borderColor.success,
    backgroundColor: colors.status.successBg,
    textColor: colors.text.success
  },
  warning: {
    borderColor: colors.borderColor.warning,
    backgroundColor: colors.status.warningBg,
    textColor: colors.text.warning
  }
} as const;
