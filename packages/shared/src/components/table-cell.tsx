import type { ReactNode } from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';

export type TableCellProps = {
  align?: ViewStyle['alignItems'];
  children: ReactNode;
  flex: number;
  onPress?: () => void;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements TableCell.
 * Parameters: children ReactNode cell content, flex number flex value, align ViewStyle alignment, onPress function optional press handler.
 * Returns: JSX table cell.
 */
export function TableCell({ align = 'center', children, flex, onPress }: TableCellProps) {
  const style = [{ flex, alignItems: align, alignSelf: 'stretch' as const, justifyContent: 'center' as const }, onPress ? pointerStyle : undefined];

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={style}>
        {children}
      </Pressable>
    );
  }

  return <View style={style}>{children}</View>;
}
