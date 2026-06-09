import { ImageBackground, Text, View, type ImageSourcePropType } from 'react-native';
import { colors } from '../tokens';

const signupPoster = 'https://onboardfrontend-production-c.squarecdn.com/builds/cd8955b/_next/static/media/us-poster.0c6c058a.webp';

export type AuthVisualProps = {
  mode: 'login' | 'register';
  backgroundSource?: ImageSourcePropType;
};

/**
 * Description: Implements AuthVisual.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function AuthVisual({ mode, backgroundSource }: AuthVisualProps) {
  const isRegister = mode === 'register';

  return (
    <ImageBackground source={backgroundSource ?? { uri: signupPoster }} resizeMode="cover" style={{ width: '100%', height: '100%', flex: 1, minHeight: 560, overflow: 'hidden' }} imageStyle={{}}>
      <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'rgba(0,0,0,0.46)', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
        <Text style={{ maxWidth: 620, textAlign: 'center', color: colors.surface, fontSize: 36, lineHeight: 44, fontWeight: '900' }}>
          {isRegister ? 'Start running your restaurant from one focused dashboard.' : 'Welcome back to your restaurant operations hub.'}
        </Text>
        <Text style={{ maxWidth: 560, marginTop: 18, textAlign: 'center', color: '#f1f1f1', fontSize: 18, lineHeight: 28, fontWeight: '600' }}>
          {isRegister
            ? 'Track orders, update menus, manage customers, and keep service moving with clear daily controls.'
            : 'Review live orders, customer activity, menu availability, and business settings in one place.'}
        </Text>
      </View>
    </ImageBackground>
  );
}
