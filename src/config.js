// Configurações centralizadas (sem números mágicos espalhados pelo código).
export const CONFIG = {
  // Chance de um Pokémon sorteado ser shiny (1/200). Ajuste aqui para testar.
  SHINY_CHANCE: 1 / 200,
  // Somente para testes: permite sortear mais de uma vez por dia.
  DEV_UNLIMITED_DRAWS: false,
  IV_MAX: 31,
  MOVES_PER_POKEMON: 4,
  NICKNAME_MAX: 12,
  GRID_COLUMNS: 5,
  PASSWORD_MIN_LENGTH: 6,
  // Rodadas de SHA-256 com salt (protótipo local; veja README).
  HASH_ROUNDS: 1000,
  // Total de espécies do projeto completo (nesta fase só 9 estão carregadas).
  FULL_DEX_TOTAL: 1025,
  SCAN_DURATION_MS: 900,
  STORAGE_PREFIX: '@pokedex/',
};

// Iniciais disponíveis na escolha: 1ª e 2ª geração..
export const STARTER_IDS = [1, 4, 7, 152, 155, 158];
