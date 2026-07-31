import {useAuth, useUser} from '@clerk/clerk-expo';
import {useQuery} from '@tanstack/react-query';
import {meRequest} from '../services/api/authApi';
import type {User} from '../types/api';

export function useAppUser() {
  const {isLoaded, isSignedIn} = useAuth();
  const {user: clerkUser} = useUser();

  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: meRequest,
    enabled: isLoaded && !!isSignedIn,
    staleTime: 60_000,
  });

  const displayName =
    user?.name?.trim() ||
    clerkUser?.fullName?.trim() ||
    clerkUser?.firstName?.trim() ||
    null;

  const email =
    user?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    '';

  const avatarUrl =
    clerkUser?.imageUrl ||
    user?.avatarUrl ||
    null;

  const appUser: User | null = user
    ? {...user, name: displayName, avatarUrl}
    : isSignedIn
      ? {
          id: '',
          email,
          name: displayName,
          avatarUrl,
        }
      : null;

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    clerkUser,
    user: appUser,
    isLoadingUser: !!isSignedIn && isLoadingUser,
    refetchUser,
  };
}
