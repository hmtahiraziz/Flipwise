import {useAuth} from '@clerk/clerk-expo';
import {useEffect} from 'react';
import {setAuthTokenGetter} from '../services/api/client';

export function ClerkTokenBridge() {
  const {getToken, isLoaded} = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });

    return () => setAuthTokenGetter(null);
  }, [getToken, isLoaded]);

  return null;
}
