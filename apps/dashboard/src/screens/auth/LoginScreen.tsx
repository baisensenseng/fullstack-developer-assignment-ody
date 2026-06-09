import loginHeroBackground from '../../../assets/auth/product-tips-background.png';
import { setAuthToken, useLoginUser } from '@ody/api-client';
import { Button, TextField, colors } from '@ody/shared';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { writeStoredToken } from '../../lib/auth-storage';
import { AuthLayout } from './AuthLayout';

/**
 * Description: Implements LoginScreen.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLoginUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    try {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      if (result.status !== 200) throw new Error('LOGIN_FAILED');
      writeStoredToken(result.data.token);
      setAuthToken(result.data.token);
      router.replace('/');
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <AuthLayout mode="login" visualSource={loginHeroBackground}>
      <View style={{ maxWidth: 590, width: '100%' }}>
        <Text style={{ fontSize: 28, lineHeight: 34, fontWeight: '800', color: colors.ink }}>Sign in</Text>
        <Text style={{ marginTop: 18, color: colors.ink }}>
          New to Ody? <Link href="/register" style={{ fontWeight: '800', textDecorationLine: 'underline' }}>Sign up</Link>
        </Text>

        <View style={{ marginTop: 20, gap: 16 }}>
          <TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        {error ? <Text style={{ marginTop: 16, color: colors.error, fontWeight: '700' }}>{error}</Text> : null}

        <View style={{ marginTop: 32 }}>
          <Button loading={loginMutation.isPending} onPress={handleSubmit}>Continue</Button>
        </View>

      </View>
    </AuthLayout>
  );
}
