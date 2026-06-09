import { setAuthToken, useRegisterUser } from '@ody/api-client';
import { Button, TextField, colors } from '@ody/shared';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { writeStoredToken } from '../../lib/auth-storage';
import { AuthLayout } from './AuthLayout';

/**
 * Description: Implements RegisterScreen.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!name.trim()) {
      setError('Enter your name to create an account.');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({ data: { name: name.trim(), email: email.trim().toLowerCase(), password } });
      if (result.status !== 201) throw new Error('REGISTER_FAILED');
      writeStoredToken(result.data.token);
      setAuthToken(result.data.token);
      router.replace('/');
    } catch (caughtError) {
      const response = caughtError as { error?: { code?: string; message?: string } };
      if (response.error?.code === 'EMAIL_ALREADY_REGISTERED') {
        setError('This email is already registered. Sign in instead.');
        return;
      }
      setError(response.error?.message ?? 'Unable to create account. Check your details and try again.');
    }
  }

  return (
    <AuthLayout mode="register">
      <View style={{ maxWidth: 500, width: '100%' }}>
        <Text style={{ fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.ink }}>Let’s create your account</Text>
        <Text style={{ marginTop: 14, fontSize: 16, lineHeight: 24, color: colors.ink }}>
          Start managing orders, menus, customers, and restaurant settings from one dashboard.
        </Text>

        <View style={{ marginTop: 40, gap: 16 }}>
          <TextField label="Name" placeholder="Restaurant manager" value={name} onChangeText={setName} autoCapitalize="words" />
          <TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <Text style={{ marginTop: 20, color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          By creating an account, you agree to use this demo restaurant dashboard for evaluation purposes.
        </Text>

        {error ? <Text style={{ marginTop: 16, color: colors.error, fontWeight: '700' }}>{error}</Text> : null}

        <View style={{ marginTop: 28 }}>
          <Button loading={registerMutation.isPending} onPress={handleSubmit}>Create account</Button>
        </View>

        <Text style={{ marginTop: 20, color: colors.ink }}>
          Already have an account? <Link href="/login" style={{ fontWeight: '800', textDecorationLine: 'underline' }}>Sign in.</Link>
        </Text>
      </View>
    </AuthLayout>
  );
}
