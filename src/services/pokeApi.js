// Camada de dados: ponto único de acesso a espécies, imagens e golpes.
// Hoje lê dados locais + sprites do PokémonDB; para trocar a fonte (ou cachear),
// basta alterar este arquivo.
import { SPECIES, SPECIES_BY_ID, MOVE_TYPES } from '../data/species';
import { STARTER_IDS } from '../config';
import { norm } from '../data/meta';

const SPRITES = 'https://img.pokemondb.net/sprites/black-white';

// Lista de URLs a tentar, em ordem (animada -> estática).
export function spriteCandidates(slug, { shiny = false, animated = false } = {}) {
  const v = shiny ? 'shiny' : 'normal';
  const staticUrl = `${SPRITES}/${v}/${slug}.png`;
  return animated ? [`${SPRITES}/anim/${v}/${slug}.gif`, staticUrl] : [staticUrl];
}

// Catálogo da Pokédex (async para permitir uma fonte remota no futuro).
export async function loadCatalog() {
  return SPECIES.filter((s) => s.emCatalogo);
}

export function getSpecies(id) {
  return SPECIES_BY_ID[id] || null;
}

// Espécies que podem ser sorteadas no Randomizar.
export function getDrawPool() {
  return SPECIES.filter((s) => s.emCatalogo);
}

export function getStarters() {
  return STARTER_IDS.map((id) => SPECIES_BY_ID[id]).filter(Boolean);
}

export function moveType(name) {
  return MOVE_TYPES[name] || 'normal';
}

// Busca para a Pokédex alternativa: número, nome exato ou prefixo do nome.
export function findInCatalog(query, catalog) {
  const q = norm(query).replace(/^#/, '').replace(/\s+/g, '-');
  if (!q) return null;
  if (/^\d+$/.test(q)) return catalog.find((s) => s.id === Number(q)) || null;
  return (
    catalog.find((s) => norm(s.name) === q) ||
    catalog.find((s) => norm(s.name).startsWith(q)) ||
    null
  );
}
