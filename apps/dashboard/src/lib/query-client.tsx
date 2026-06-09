import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiBaseUrl, setAuthToken } from '@ody/api-client';
import { readStoredToken } from './auth-storage';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

/**
 * Description: Resolves the API base URL for local development and deployed web builds.
 * Parameters: None.
 * Returns: string - API base URL without a trailing slash.
 */
function resolveApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev')) {
    return 'https://ody-backend.605835802.workers.dev';
  }

  return 'http://localhost:8787';
}

setApiBaseUrl(resolveApiBaseUrl());
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
