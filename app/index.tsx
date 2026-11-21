import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store';

/**
 * Route awal `/` (civicpulse:///). Semua layar ada di dalam grup (auth)/(tabs),
 * jadi tanpa file ini app membuka "Unmatched Route".
 */
export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.user !== null);
  return <Redirect href={isLoggedIn ? '/map' : '/login'} />;
}
