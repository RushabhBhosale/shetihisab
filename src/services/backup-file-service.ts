import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareBackupJson(json: string, dialogTitle: string) {
  const date = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `shetihisab-backup-${date}.json`);
  file.create({ overwrite: true });
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available.');
  }
  await Sharing.shareAsync(file.uri, {
    dialogTitle,
    mimeType: 'application/json',
    UTI: 'public.json',
  });
}

export async function pickBackupJson() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) {
    return null;
  }
  return new File(result.assets[0].uri).text();
}
