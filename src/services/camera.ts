// TODO(Orang 2): implementasi asli (Minggu 2) — stub sementara dibuat Orang 1
// agar form lapor bisa dites. Signature sesuai PROJECT_CONTEXT §5.3, silakan ganti seluruh isi file.
import * as ImagePicker from 'expo-image-picker';

/** Buka kamera dan kembalikan uri lokal foto, atau null jika batal / izin ditolak. */
export async function capturePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
