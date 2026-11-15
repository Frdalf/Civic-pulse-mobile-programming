import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  return (
    <ScreenPlaceholder
      title="Profil"
      description={user ? user.email : 'Belum masuk (login aktif mulai Minggu 2).'}
    />
  );
}
