import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const SIZE = 320;

async function shrink(uri) {
  const opts = { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7, base64: true };
  // API nova (SDK 52+); se não existir, usa a antiga.
  if (ImageManipulator.ImageManipulator && ImageManipulator.ImageManipulator.manipulate) {
    const ctx = ImageManipulator.ImageManipulator.manipulate(uri);
    ctx.resize({ width: SIZE });
    const image = await ctx.renderAsync();
    const out = await image.saveAsync(opts);
    return out.base64;
  }
  const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: SIZE } }], opts);
  return out.base64;
}

async function finish(result) {
  if (result.canceled || !result.assets || !result.assets.length) return null;
  const base64 = await shrink(result.assets[0].uri);
  return `data:image/jpeg;base64,${base64}`;
}

export async function takePhoto() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Permita o acesso à câmera nas configurações do aparelho para tirar uma foto.');
  return finish(await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 }));
}

export async function pickPhoto() {
  return finish(await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 }));
}