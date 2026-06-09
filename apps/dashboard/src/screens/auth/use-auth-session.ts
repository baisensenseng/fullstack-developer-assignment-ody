import { setAuthToken, useGetCurrentUser, useLogoutUser } from '@ody/api-client';
import { useRouter } from 'expo-router';
import { clearStoredToken, readStoredToken } from '../../lib/auth-storage';

/**
 * Description: Implements useAuthSession.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function useAuthSession() {
  const router = useRouter();
  const hasToken = Boolean(readStoredToken());
  const meQuery = useGetCurrentUser({ query: { enabled: hasToken, retry: false } });
  const logoutMutation = useLogoutUser();

  const currentUser = meQuery.data?.status === 200 ? meQuery.data.data.user : null;

  return {
    user: currentUser,
    isLoading: hasToken && meQuery.isLoading,
    isAuthenticated: Boolean(currentUser),
    async logout() {
      await logoutMutation.mutateAsync();
      clearStoredToken();
      setAuthToken(null);
      router.replace('/login');
    }
  };
}
