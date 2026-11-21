import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ErrorText } from '@/components/ui/ErrorText';
import { FormScreen } from '@/components/ui/FormScreen';
import { TextField } from '@/components/ui/TextField';
import { CATEGORY_META, REPORT_CATEGORIES } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { useCreateReport } from '@/hooks/useCreateReport';

export default function CreateReportScreen() {
  const f = useCreateReport();

  const onSubmit = async () => {
    if (await f.submit()) Alert.alert('Terkirim', 'Laporan Anda berhasil dikirim. Terima kasih!');
  };

  return (
    <FormScreen>
      <Text style={styles.title} accessibilityRole="header">
        Buat Laporan
      </Text>

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {REPORT_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_META[c].label}
            color={CATEGORY_META[c].color}
            selected={f.category === c}
            onPress={() => f.setCategory(c)}
          />
        ))}
      </View>

      <TextField
        label="Deskripsi"
        value={f.description}
        onChangeText={f.setDescription}
        multiline
        maxLength={500}
        placeholder="Jelaskan masalah dan patokan lokasinya"
      />

      <Text style={styles.label}>Lokasi</Text>
      <Text style={styles.location}>
        {f.location
          ? `${f.location.latitude.toFixed(5)}, ${f.location.longitude.toFixed(5)}`
          : (f.locationError ?? 'Mencari lokasi…')}
      </Text>

      <Text style={styles.label}>Foto</Text>
      {f.photoUri ? (
        <Image
          source={{ uri: f.photoUri }}
          style={styles.photo}
          accessibilityLabel="Pratinjau foto laporan"
        />
      ) : null}
      <Button
        label={f.photoUri ? 'Ambil Ulang Foto' : 'Ambil Foto'}
        variant="secondary"
        onPress={f.takePhoto}
        loading={f.isCapturing}
        disabled={!f.location}
        accessibilityHint="Membuka kamera; koordinat dan waktu dicetak di foto"
      />

      <View style={styles.spacer} />
      <ErrorText message={f.error} />
      <Button label="Kirim Laporan" onPress={onSubmit} loading={f.isSubmitting} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 16, fontSize: 24, fontWeight: '700', color: colors.text },
  label: { marginBottom: 6, fontWeight: '600', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  location: { marginBottom: 16, color: colors.textMuted },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, marginBottom: 8 },
  spacer: { height: 24 },
});
