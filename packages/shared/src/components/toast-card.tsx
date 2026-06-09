import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../tokens';
import type { StatusBadgeTone } from './status-badge';

export type ToastCardProps = {
  message: string;
  title?: string;
  tone?: StatusBadgeTone;
  onClose?: () => void;
};

export type ToastOptions = {
  message: string;
  title?: string;
  tone?: StatusBadgeTone;
  durationMs?: number;
};

type ToastRecord = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastOptions) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : undefined;

const toastToneStyles = {
  success: { backgroundColor: colors.status.successBg, borderColor: colors.borderColor.success, color: colors.text.success },
  warning: { backgroundColor: colors.status.warningBg, borderColor: colors.borderColor.warning, color: colors.text.warning },
  error: { backgroundColor: colors.status.errorBg, borderColor: colors.borderColor.error, color: colors.text.error },
  info: { backgroundColor: colors.status.infoBg, borderColor: colors.borderColor.info, color: colors.text.info }
} as const;

/**
 * Description: Implements createToastId.
 * Parameters: none.
 * Returns: string unique toast identifier.
 */
function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Description: Implements ToastCard.
 * Parameters: message string visible feedback message, title string optional feedback title, tone StatusBadgeTone semantic feedback tone, onClose optional close handler.
 * Returns: JSX toast-like feedback card.
 */
export function ToastCard({ message, onClose, title, tone = 'info' }: ToastCardProps) {
  const style = toastToneStyles[tone];

  return (
    <View style={{ borderWidth: 1, borderColor: style.borderColor, borderRadius: radius.md, backgroundColor: style.backgroundColor, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          {title ? <Text style={{ color: style.color, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{title}</Text> : null}
          <Text style={{ marginTop: title ? spacing.xs : 0, color: style.color, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight }}>{message}</Text>
        </View>
        {onClose ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onClose} style={[{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, pointerStyle]}>
            <Text style={{ color: style.color, fontSize: typography.bodyStrong.fontSize, fontWeight: '900' }}>×</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Description: Implements ToastProvider.
 * Parameters: children ReactNode application subtree.
 * Returns: JSX provider with a floating toast viewport.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  /**
   * Description: Implements dismissToast.
   * Parameters: id string toast identifier.
   * Returns: void after removing the toast.
   */
  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  /**
   * Description: Implements showToast.
   * Parameters: toast ToastOptions toast content and behavior.
   * Returns: void after adding the toast and scheduling dismissal.
   */
  function showToast(toast: ToastOptions) {
    const id = createToastId();
    const nextToast = { ...toast, id };
    setToasts((current) => [nextToast, ...current].slice(0, 4));

    if (toast.durationMs !== 0) {
      setTimeout(() => dismissToast(id), toast.durationMs ?? 4200);
    }
  }

  const value = useMemo(() => ({ dismissToast, showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: 24, right: 24, width: 360, maxWidth: '90%', gap: spacing.sm, zIndex: 1000 }}>
        {toasts.map((toast) => <ToastCard key={toast.id} title={toast.title} message={toast.message} tone={toast.tone} onClose={() => dismissToast(toast.id)} />)}
      </View>
    </ToastContext.Provider>
  );
}

/**
 * Description: Implements useToast.
 * Parameters: none.
 * Returns: ToastContextValue toast actions for showing and dismissing global toast messages.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
