import * as auth from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

jest.mock('@/services/supabase', () => ({ isSupabaseConfigured: true }));
jest.mock('@/services/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  restoreSession: jest.fn(),
}));

const mocked = jest.mocked(auth);
const USER = { id: 'u1', email: 'warga@example.com' };

beforeEach(() => {
  jest.resetAllMocks();
  useAuthStore.setState({ user: null, isHydrated: false });
});

describe('useAuthStore', () => {
  it('hydrate memulihkan sesi dari secure-store', async () => {
    mocked.restoreSession.mockResolvedValue(USER);
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState()).toMatchObject({ user: USER, isHydrated: true });
  });

  it('hydrate tetap menandai isHydrated walau gagal', async () => {
    mocked.restoreSession.mockRejectedValue(new Error('offline'));
    await expect(useAuthStore.getState().hydrate()).resolves.toBeUndefined();
    expect(useAuthStore.getState()).toMatchObject({ user: null, isHydrated: true });
  });

  it('login menyimpan user, error diteruskan ke pemanggil', async () => {
    mocked.signIn.mockResolvedValueOnce(USER);
    await useAuthStore.getState().login(' warga@example.com ', 'rahasia');
    expect(mocked.signIn).toHaveBeenCalledWith('warga@example.com', 'rahasia');
    expect(useAuthStore.getState().user).toEqual(USER);

    useAuthStore.setState({ user: null });
    mocked.signIn.mockRejectedValueOnce(new Error('Email atau password salah.'));
    await expect(useAuthStore.getState().login('a@b.c', 'x')).rejects.toThrow('salah');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('register mengembalikan false bila perlu konfirmasi email', async () => {
    mocked.signUp.mockResolvedValue({ user: null });
    await expect(useAuthStore.getState().register('a@b.c', 'rahasia')).resolves.toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout mengosongkan user walau request server gagal', async () => {
    useAuthStore.setState({ user: USER });
    mocked.signOut.mockRejectedValue(new Error('offline'));
    await expect(useAuthStore.getState().logout()).rejects.toThrow();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
