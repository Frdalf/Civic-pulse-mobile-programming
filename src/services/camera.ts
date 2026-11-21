import * as ImagePicker from 'expo-image-picker';

/**
 * Membuka kamera perangkat dan mengambil foto bukti insiden (Orang 2 — Minggu 2).
 * Menangani izin kamera secara Just-In-Time (JIT) dan memastikan penolakan izin
 * atau pembatalan tidak menyebabkan crash.
 *
 * @returns URI lokal berkas foto yang berhasil diambil, atau `null` jika batal / izin ditolak.
 */
export async function capturePhoto(): Promise<string | null> {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    let finalStatus = status;

    if (finalStatus !== ImagePicker.PermissionStatus.GRANTED) {
      const requested = await ImagePicker.requestCameraPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== ImagePicker.PermissionStatus.GRANTED) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0]?.uri ?? null;
  } catch (error) {
    console.warn('[Camera] Gagal mengambil foto:', error);
    return null;
  }
}
