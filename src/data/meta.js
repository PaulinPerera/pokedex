export const TYPE_COLORS = {
  fire: '#FF6B35', water: '#4A90D9', grass: '#48C774', electric: '#F5D800',
  psychic: '#FF6EB4', ice: '#74D0F0', dragon: '#7038F8', dark: '#705848',
  fairy: '#EE99AC', normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
  poison: '#A040A0', ground: '#E0C068', rock: '#B8A038', bug: '#A8B820',
  ghost: '#705898', steel: '#B8B8D0',
};

export const TYPE_NAMES = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta', electric: 'Elétrico',
  ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno', ground: 'Terra', flying: 'Voador',
  psychic: 'Psíquico', bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão',
  dark: 'Sombrio', steel: 'Aço', fairy: 'Fada',
};
export const TYPE_ORDER = Object.keys(TYPE_NAMES);

export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const GEN_ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX' };

export const RARITIES = [
  { id: 'normal', label: 'Comum' },
  { id: 'fossil', label: 'Fóssil' },
  { id: 'pseudo', label: 'Pseudo-lendário' },
  { id: 'legendary', label: 'Lendário' },
  { id: 'mythical', label: 'Mítico' },
];
export const RARITY_LABEL = Object.fromEntries(RARITIES.map((r) => [r.id, r.label]));

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const STAT_LABELS = {
  hp: 'HP', atk: 'Ataque', def: 'Defesa', spa: 'Atq. Esp.', spd: 'Def. Esp.', spe: 'Velocidade',
};

// Treinadores (imagens em assets/avatars: corpo inteiro "full" e recorte "bust").
export const AVATARS = [
  { id: 'red', name: 'Red', color: '#E53935', full: require('../../assets/avatars/red.png'), bust: require('../../assets/avatars/red-bust.png') },
  { id: 'leaf', name: 'Leaf', color: '#43A047', full: require('../../assets/avatars/leaf.png'), bust: require('../../assets/avatars/leaf-bust.png') },
];

export function norm(text) {
  let t = String(text || '').toLowerCase();
  try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* mantém */ }
  return t.trim();
}
