import type { ReactNode } from 'react';
import { View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { AuthVisual, spacing } from '@ody/shared';

export type AuthLayoutProps = {
  children: ReactNode;
  mode: 'login' | 'register';
  visualSource?: ImageSourcePropType;
};

/**
 * Description: Implements AuthLayout.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function AuthLayout({ children, mode, visualSource }: AuthLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 960;

  return (
    <View style={{ width, minHeight: height, flex: 1, backgroundColor: '#ffffff', padding: isCompact ? 20 : 0 }}>
      <View style={{ width: '100%', minHeight: isCompact ? '100%' : height, flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: isCompact ? 24 : 0, alignItems: 'stretch' }}>
        <View style={{ width: isCompact ? '100%' : '50%', flexBasis: isCompact ? undefined : '50%', flexGrow: 0, flexShrink: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: isCompact ? 4 : 72, paddingVertical: 40 }}>
          {children}
        </View>
        {!isCompact ? (
          <View style={{ width: '50%', flexBasis: '50%', flexGrow: 0, flexShrink: 0, minHeight: height, padding: spacing.xl }}>
            <AuthVisual mode={mode} backgroundSource={visualSource} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
