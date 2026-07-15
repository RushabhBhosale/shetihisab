import * as DocumentPicker from 'expo-document-picker';

export async function shareBackupJson(json: string, _dialogTitle: string) {
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `shetihisab-backup-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function pickBackupJson() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    multiple: false,
    base64: false,
  });
  if (result.canceled) {
    return null;
  }
  const asset = result.assets[0];
  if (asset.file) {
    return asset.file.text();
  }
  const response = await fetch(asset.uri);
  return response.text();
}
