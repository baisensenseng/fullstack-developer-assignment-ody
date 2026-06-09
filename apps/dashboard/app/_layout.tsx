import { ToastProvider } from '@ody/shared';
import { Stack } from 'expo-router';
import { AppProviders } from '../src/lib/query-client';

/**
 * Description: Implements RootLayout.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </AppProviders>
  );
}
