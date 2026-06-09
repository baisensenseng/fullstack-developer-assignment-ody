import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiBaseUrl, setAuthToken } from '@ody/api-client';
import { readStoredToken } from './auth-storage';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8787';
setApiBaseUrl(apiBaseUrl);
setAuthToken(readStoredToken());

export type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Description: Implements AppProviders.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
