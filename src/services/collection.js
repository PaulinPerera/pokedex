// Regras de criação de exemplares (IVs, golpes, shiny) e de data do sorteio diário.
import * as Crypto from 'expo-crypto';
import { CONFIG } from '../config';
import { STAT_KEYS } from '../data/meta';

export function newInstanceId() {
  try { return Crypto.randomUUID(); } catch (e) {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const cleanNickname = (n) => (n || '').trim().slice(0, CONFIG.NICKNAME_MAX);

export function rollIVs() {
  const ivs = {};
  STAT_KEYS.forEach((k) => { ivs[k] = Math.floor(Math.random() * (CONFIG.IV_MAX + 1)); });
  return ivs;
}

export const rollShiny = () => Math.random() < CONFIG.SHINY_CHANCE;

// Sorteia golpes distintos apenas dentro dos que a espécie realmente pode aprender.
export function rollMoves(species) {
  const pool = [...species.golpes];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(CONFIG.MOVES_PER_POKEMON, pool.length));
}

export function createInstance(species, { origin, nickname = '', allowShiny = false }) {
  return {
    instanceId: newInstanceId(),
    speciesId: species.id,
    nickname: cleanNickname(nickname),
    shiny: allowShiny ? rollShiny() : false,
    ivs: rollIVs(),
    moves: rollMoves(species),
    origin, // 'inicial' | 'randomizador'
    obtainedAt: new Date().toISOString(),
  };
}

export const ivTotal = (ivs) => STAT_KEYS.reduce((sum, k) => sum + (ivs[k] || 0), 0);

// Datas locais (o "dia" muda à meia-noite do fuso do aparelho).
export function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
export const nextMidnight = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
