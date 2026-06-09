import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../tokens';

export type ModalFrameProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
  onClose: () => void;
  visible: boolean;
};

/**
 * Description: Implements ModalFrame.
 * Parameters: visible boolean modal state, onClose function close handler, children ReactNode modal content, contentStyle ViewStyle optional content overrides.
 * Returns: JSX centered modal frame with backdrop.
 */
export function ModalFrame({ children, contentStyle, onClose, visible }: ModalFrameProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View style={[{ width: 920, maxWidth: '96%', maxHeight: '90%', borderRadius: radius.lg, backgroundColor: colors.background.elevated, padding: spacing.xl }, contentStyle]}>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
