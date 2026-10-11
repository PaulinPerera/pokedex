// Dados locais das espécies. Os 9 primeiros (Gen 1: Bulbasaur, Charmander, Squirtle e evoluções)
// formam o catálogo/sorteio desta fase (emCatalogo: true). Os da Gen 2 existem apenas
// para que os iniciais de Johto possam ser escolhidos e exibidos no PC (emCatalogo: false).
const st = (hp, atk, def, spa, spd, spe) => ({ hp, atk, def, spa, spd, spe });

// Golpes que a linha evolutiva realmente pode aprender (nível ou TM).
const POOLS = {
  bulbasaur: ['Tackle', 'Growl', 'Leech Seed', 'Vine Whip', 'Poison Powder', 'Sleep Powder', 'Take Down',
    'Razor Leaf', 'Sweet Scent', 'Growth', 'Double-Edge', 'Synthesis', 'Solar Beam', 'Sludge Bomb',
    'Giga Drain', 'Toxic', 'Protect', 'Swords Dance'],
  charmander: ['Scratch', 'Growl', 'Ember', 'Smokescreen', 'Dragon Rage', 'Scary Face', 'Fire Fang', 'Slash',
    'Flamethrower', 'Fire Spin', 'Dragon Claw', 'Rock Slide', 'Swords Dance', 'Toxic', 'Protect', 'Fire Blast'],
  squirtle: ['Tackle', 'Tail Whip', 'Bubble', 'Withdraw', 'Water Gun', 'Bite', 'Rapid Spin', 'Protect',
    'Water Pulse', 'Aqua Tail', 'Skull Bash', 'Iron Defense', 'Rain Dance', 'Hydro Pump', 'Surf', 'Ice Beam', 'Toxic'],
  chikorita: ['Tackle', 'Growl', 'Razor Leaf', 'Poison Powder', 'Synthesis', 'Reflect', 'Body Slam', 'Sweet Scent',
    'Magical Leaf', 'Solar Beam', 'Giga Drain', 'Swords Dance', 'Toxic', 'Protect'],
  cyndaquil: ['Tackle', 'Leer', 'Smokescreen', 'Ember', 'Quick Attack', 'Flame Wheel', 'Swift', 'Defense Curl',
    'Flamethrower', 'Fire Blast', 'Toxic', 'Protect'],
  totodile: ['Scratch', 'Leer', 'Water Gun', 'Bite', 'Scary Face', 'Slash', 'Screech', 'Crunch', 'Hydro Pump',
    'Surf', 'Ice Beam', 'Rain Dance', 'Toxic', 'Protect'],
};

export const MOVE_TYPES = {
  'Tackle': 'normal', 'Growl': 'normal', 'Leech Seed': 'grass', 'Vine Whip': 'grass', 'Poison Powder': 'poison',
  'Sleep Powder': 'grass', 'Take Down': 'normal', 'Razor Leaf': 'grass', 'Sweet Scent': 'normal', 'Growth': 'normal',
  'Double-Edge': 'normal', 'Synthesis': 'grass', 'Solar Beam': 'grass', 'Sludge Bomb': 'poison', 'Giga Drain': 'grass',
  'Toxic': 'poison', 'Protect': 'normal', 'Swords Dance': 'normal', 'Petal Dance': 'grass',
  'Scratch': 'normal', 'Ember': 'fire', 'Smokescreen': 'normal', 'Dragon Rage': 'dragon', 'Scary Face': 'normal',
  'Fire Fang': 'fire', 'Slash': 'normal', 'Flamethrower': 'fire', 'Fire Spin': 'fire', 'Dragon Claw': 'dragon',
  'Rock Slide': 'rock', 'Fire Blast': 'fire', 'Wing Attack': 'flying', 'Air Slash': 'flying', 'Heat Wave': 'fire',
  'Tail Whip': 'normal', 'Bubble': 'water', 'Withdraw': 'water', 'Water Gun': 'water', 'Bite': 'dark',
  'Rapid Spin': 'normal', 'Water Pulse': 'water', 'Aqua Tail': 'water', 'Skull Bash': 'normal', 'Iron Defense': 'steel',
  'Rain Dance': 'water', 'Hydro Pump': 'water', 'Surf': 'water', 'Ice Beam': 'ice',
  'Reflect': 'psychic', 'Body Slam': 'normal', 'Magical Leaf': 'grass', 'Leer': 'normal', 'Quick Attack': 'normal',
  'Flame Wheel': 'fire', 'Swift': 'normal', 'Defense Curl': 'normal', 'Screech': 'normal', 'Crunch': 'dark',
};

const mk = (o) => ({ category: 'normal', emCatalogo: true, formas: [], extras: [], ...o });

const RAW = [
  // ===== Linha de Bulbasaur =====
  mk({ id: 1, slug: 'bulbasaur', name: 'Bulbasaur', gen: 1, types: ['grass', 'poison'], altura: '0,7 m', peso: '6,9 kg',
    stats: st(45, 49, 49, 65, 65, 45), pool: 'bulbasaur', linha: { ids: [1, 2, 3], niveis: [16, 32] },
    desc: 'Uma semente estranha foi plantada em suas costas ao nascer. Ela germina e cresce conforme o Pokémon se desenvolve.' }),
  mk({ id: 2, slug: 'ivysaur', name: 'Ivysaur', gen: 1, types: ['grass', 'poison'], altura: '1,0 m', peso: '13,0 kg',
    stats: st(60, 62, 63, 80, 80, 60), pool: 'bulbasaur', linha: { ids: [1, 2, 3], niveis: [16, 32] },
    desc: 'O bulbo em suas costas absorve nutrientes e cresce. Quando está perto de florescer, ele passa mais tempo sob o sol.' }),
  mk({ id: 3, slug: 'venusaur', name: 'Venusaur', gen: 1, types: ['grass', 'poison'], altura: '2,0 m', peso: '100,0 kg',
    stats: st(80, 82, 83, 100, 100, 80), pool: 'bulbasaur', extras: ['Petal Dance'], linha: { ids: [1, 2, 3], niveis: [16, 32] },
    desc: 'A grande flor em suas costas converte a luz do sol em energia. Depois da chuva, suas cores ficam ainda mais vivas.',
    formas: [
      { nome: 'Mega Venusaur', tipos: ['grass', 'poison'], nota: 'Mega Evolução via Venusaurita. Habilidade: Thick Fat.', stats: st(80, 100, 123, 122, 120, 80) },
      { nome: 'Gigantamax Venusaur', tipos: ['grass', 'poison'], nota: 'Forma Gigantamax. Golpe exclusivo: G-Max Vine Lash.' },
    ] }),

  // ===== Linha de Charmander =====
  mk({ id: 4, slug: 'charmander', name: 'Charmander', gen: 1, types: ['fire'], altura: '0,6 m', peso: '8,5 kg',
    stats: st(39, 52, 43, 60, 50, 65), pool: 'charmander', linha: { ids: [4, 5, 6], niveis: [16, 36] },
    desc: 'A chama na ponta da cauda mostra sua vitalidade: queima forte quando ele está saudável e enfraquece quando está doente.' }),
  mk({ id: 5, slug: 'charmeleon', name: 'Charmeleon', gen: 1, types: ['fire'], altura: '1,1 m', peso: '19,0 kg',
    stats: st(58, 64, 58, 80, 65, 80), pool: 'charmander', linha: { ids: [4, 5, 6], niveis: [16, 36] },
    desc: 'Muito agressivo, ele luta usando a cauda em chamas. Quando se empolga, as chamas ficam ainda mais intensas.' }),
  mk({ id: 6, slug: 'charizard', name: 'Charizard', gen: 1, types: ['fire', 'flying'], altura: '1,7 m', peso: '90,5 kg',
    stats: st(78, 84, 78, 109, 85, 100), pool: 'charmander', extras: ['Wing Attack', 'Air Slash', 'Heat Wave'],
    linha: { ids: [4, 5, 6], niveis: [16, 36] },
    desc: 'Voa pelos céus em busca de adversários fortes. Sua chama fica ainda mais quente depois de duros combates.',
    formas: [
      { nome: 'Mega Charizard X', tipos: ['fire', 'dragon'], nota: 'Mega Evolução via Charizardita X. Habilidade: Tough Claws.', stats: st(78, 130, 111, 130, 85, 100) },
      { nome: 'Mega Charizard Y', tipos: ['fire', 'flying'], nota: 'Mega Evolução via Charizardita Y. Habilidade: Drought.', stats: st(78, 104, 78, 159, 115, 100) },
      { nome: 'Gigantamax Charizard', tipos: ['fire', 'flying'], nota: 'Forma Gigantamax. Golpe exclusivo: G-Max Wildfire.' },
    ] }),

  // ===== Linha de Squirtle =====
  mk({ id: 7, slug: 'squirtle', name: 'Squirtle', gen: 1, types: ['water'], altura: '0,5 m', peso: '9,0 kg',
    stats: st(44, 48, 65, 50, 64, 43), pool: 'squirtle', linha: { ids: [7, 8, 9], niveis: [16, 36] },
    desc: 'Quando se sente ameaçado, recolhe-se em seu casco e revida com jatos d\'água precisos.' }),
  mk({ id: 8, slug: 'wartortle', name: 'Wartortle', gen: 1, types: ['water'], altura: '1,0 m', peso: '22,5 kg',
    stats: st(59, 63, 80, 65, 80, 58), pool: 'squirtle', linha: { ids: [7, 8, 9], niveis: [16, 36] },
    desc: 'Sua cauda peluda é símbolo de longevidade. Ele usa as orelhas e a cauda para se equilibrar ao nadar.' }),
  mk({ id: 9, slug: 'blastoise', name: 'Blastoise', gen: 1, types: ['water'], altura: '1,6 m', peso: '85,5 kg',
    stats: st(79, 83, 100, 85, 105, 78), pool: 'squirtle', linha: { ids: [7, 8, 9], niveis: [16, 36] },
    desc: 'Os canhões em seu casco disparam jatos d\'água fortes o bastante para atravessar placas de aço.',
    formas: [
      { nome: 'Mega Blastoise', tipos: ['water'], nota: 'Mega Evolução via Blastoisita. Habilidade: Mega Launcher.', stats: st(79, 103, 120, 135, 115, 78) },
      { nome: 'Gigantamax Blastoise', tipos: ['water'], nota: 'Forma Gigantamax. Golpe exclusivo: G-Max Cannonade.' },
    ] }),

  // ===== Iniciais de Johto (apenas para a escolha de inicial) =====
  mk({ id: 152, slug: 'chikorita', name: 'Chikorita', gen: 2, types: ['grass'], altura: '0,9 m', peso: '6,4 kg', emCatalogo: false,
    stats: st(45, 49, 65, 49, 65, 45), pool: 'chikorita', linha: { ids: [152, 153, 154], niveis: [16, 32] },
    desc: 'A folha em sua cabeça libera um aroma suave que acalma quem estiver por perto. Adora tomar sol.' }),
  mk({ id: 153, slug: 'bayleef', name: 'Bayleef', gen: 2, types: ['grass'], altura: '1,2 m', peso: '15,8 kg', emCatalogo: false,
    stats: st(60, 62, 80, 63, 80, 60), pool: 'chikorita', linha: { ids: [152, 153, 154], niveis: [16, 32] },
    desc: 'O colar de folhas ao redor do pescoço exala um cheiro que anima quem o sente.' }),
  mk({ id: 154, slug: 'meganium', name: 'Meganium', gen: 2, types: ['grass'], altura: '1,8 m', peso: '100,5 kg', emCatalogo: false,
    stats: st(80, 82, 100, 83, 100, 80), pool: 'chikorita', linha: { ids: [152, 153, 154], niveis: [16, 32] },
    desc: 'O perfume de suas pétalas acalma o ânimo das pessoas e faz brotar vitalidade nas plantas.' }),
  mk({ id: 155, slug: 'cyndaquil', name: 'Cyndaquil', gen: 2, types: ['fire'], altura: '0,5 m', peso: '7,9 kg', emCatalogo: false,
    stats: st(39, 52, 43, 60, 50, 65), pool: 'cyndaquil', linha: { ids: [155, 156, 157], niveis: [14, 36] },
    desc: 'Tímido, ele se enrola quando assustado. As chamas em suas costas se acendem quando ele se irrita.' }),
  mk({ id: 156, slug: 'quilava', name: 'Quilava', gen: 2, types: ['fire'], altura: '0,9 m', peso: '19,0 kg', emCatalogo: false,
    stats: st(58, 64, 58, 80, 65, 80), pool: 'cyndaquil', linha: { ids: [155, 156, 157], niveis: [14, 36] },
    desc: 'Protege-se com uma cortina de calor e fumaça. As chamas do pescoço ficam intensas durante as lutas.' }),
  mk({ id: 157, slug: 'typhlosion', name: 'Typhlosion', gen: 2, types: ['fire'], altura: '1,7 m', peso: '79,5 kg', emCatalogo: false,
    stats: st(78, 84, 78, 109, 85, 100), pool: 'cyndaquil', linha: { ids: [155, 156, 157], niveis: [14, 36] },
    desc: 'Cria nuvens de calor com as chamas do pescoço e incendeia o terreno ao redor em combates ferozes.' }),
  mk({ id: 158, slug: 'totodile', name: 'Totodile', gen: 2, types: ['water'], altura: '0,6 m', peso: '9,5 kg', emCatalogo: false,
    stats: st(50, 65, 64, 44, 48, 43), pool: 'totodile', linha: { ids: [158, 159, 160], niveis: [18, 30] },
    desc: 'Pequeno e agitado, ele morde tudo o que vê quando se empolga. Suas mandíbulas são surpreendentemente fortes.' }),
  mk({ id: 159, slug: 'croconaw', name: 'Croconaw', gen: 2, types: ['water'], altura: '1,1 m', peso: '25,0 kg', emCatalogo: false,
    stats: st(65, 80, 80, 59, 63, 58), pool: 'totodile', linha: { ids: [158, 159, 160], niveis: [18, 30] },
    desc: 'Quando suas mandíbulas se fecham, nada as abre. Presas quebradas crescem de novo.' }),
  mk({ id: 160, slug: 'feraligatr', name: 'Feraligatr', gen: 2, types: ['water'], altura: '2,3 m', peso: '88,8 kg', emCatalogo: false,
    stats: st(85, 105, 100, 79, 83, 78), pool: 'totodile', linha: { ids: [158, 159, 160], niveis: [18, 30] },
    desc: 'Trava presas enormes com as mandíbulas poderosas e salta com agilidade em combate.' }),
];

// Golpes finais por espécie = pool da linha + extras da espécie.
export const SPECIES = RAW.map((s) => ({ ...s, golpes: [...POOLS[s.pool], ...s.extras] }));
export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
