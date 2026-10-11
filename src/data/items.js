// Um exemplar de cada categoria da Bag (catálogo informativo, sem inventário).
export const ITEM_CATEGORIES = [
  { id: 'pokeballs', label: 'Poké Bolas', icon: 'ellipse' },
  { id: 'medicine', label: 'Medicamentos', icon: 'medkit' },
  { id: 'berries', label: 'Frutas', icon: 'nutrition' },
  { id: 'battle', label: 'Itens de Batalha', icon: 'flash' },
  { id: 'held', label: 'Itens Mantidos', icon: 'hand-left' },
  { id: 'stones', label: 'Pedras de Evolução', icon: 'diamond' },
  { id: 'tms', label: 'TMs e HMs', icon: 'disc' },
  { id: 'key', label: 'Itens-chave', icon: 'key' },
];

export const ITEMS = [
  {
    id: 'poke-ball', slug: 'poke-ball', name: 'Poké Ball', category: 'pokeballs',
    description: 'Uma esfera de captura de uso geral, a mais comum entre os treinadores.',
    use: 'Arremesse em um Pokémon selvagem para tentar capturá-lo. Quanto mais enfraquecido ele estiver, maior a chance.',
  },
  {
    id: 'potion', slug: 'potion', name: 'Potion', category: 'medicine',
    description: 'Um spray medicinal que cura ferimentos.',
    use: 'Restaura 20 PS de um Pokémon. Pode ser usada dentro e fora de batalha.',
  },
  {
    id: 'oran-berry', slug: 'oran-berry', name: 'Oran Berry', category: 'berries',
    description: 'Uma fruta azul e suculenta que ajuda na recuperação de energia.',
    use: 'Quando mantida por um Pokémon, restaura 10 PS automaticamente ao chegar à metade do HP.',
  },
  {
    id: 'x-attack', slug: 'x-attack', name: 'X Attack', category: 'battle',
    description: 'Um item que aumenta temporariamente a força física do Pokémon.',
    use: 'Usado em batalha, aumenta o Ataque do Pokémon até ele sair de campo (+2 estágios nos jogos recentes).',
  },
  {
    id: 'leftovers', slug: 'leftovers', name: 'Leftovers', category: 'held',
    description: 'Sobras de comida que o Pokémon mordisca durante o combate.',
    use: 'Mantido por um Pokémon, restaura 1/16 do HP máximo dele ao fim de cada turno.',
  },
  {
    id: 'fire-stone', slug: 'fire-stone', name: 'Fire Stone', category: 'stones',
    description: 'Uma pedra com uma chama alaranjada brilhando em seu interior.',
    use: 'Faz evoluir certos Pokémon, como Vulpix, Growlithe e Eevee (para Flareon).',
  },
  {
    id: 'tm-flamethrower', slug: 'tm-fire', name: 'TM — Flamethrower', category: 'tms',
    description: 'Um disco que contém o golpe Flamethrower (Lança-chamas).',
    use: 'Ensina Flamethrower a um Pokémon compatível. Nos jogos recentes pode ser usada várias vezes.',
  },
  {
    id: 'bicycle', slug: 'bicycle', name: 'Bicycle', category: 'key',
    description: 'Uma bicicleta dobrável e leve, feita para percorrer o mapa com rapidez.',
    use: 'Permite se deslocar bem mais rápido pelo mapa. Item-chave: não pode ser descartado nem vendido.',
  },
];

export const itemImageUrl = (slug) => `https://img.pokemondb.net/sprites/items/${slug}.png`;
