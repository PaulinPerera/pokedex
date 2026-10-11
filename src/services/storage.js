import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

const k = (s) => CONFIG.STORAGE_PREFIX + s;
export const keys = {
  accounts: k('accounts'),
  session: k('session'),
  settings: k('settings'),
  pc: (id) => k(`pc/${id}`),
  game: (id) => k(`game/${id}`),
};

export async function readJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export async function writeJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Grava vários itens de uma vez (usado para PC + estado do jogo no mesmo fluxo).
export async function writeMany(entries) {
  await AsyncStorage.multiSet(entries.map(([key, value]) => [key, JSON.stringify(value)]));
}

export async function removeKeys(list) {
  await AsyncStorage.multiRemove(list);
}
