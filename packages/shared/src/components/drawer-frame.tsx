import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { colors, spacing } from '../tokens';

export type DrawerFrameProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
  onClose: () => void;
  visible: boolean;
};

/**
 * Description: Implements DrawerFrame.
 * Parameters: visible boolean drawer state, onClose function close handler, children ReactNode drawer content, contentStyle ViewStyle optional panel overrides.
 * Returns: JSX right-side drawer frame with backdrop.
 */
export function DrawerFrame({ children, contentStyle, onClose, visible }: DrawerFrameProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'flex-end' }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View style={[{ width: 520, maxWidth: '92%', height: '100%', backgroundColor: colors.background.elevated, padding: spacing.xl }, contentStyle]}>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
