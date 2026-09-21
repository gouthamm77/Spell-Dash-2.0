// ─── Hero Definitions ───
export const HEROES = [
  { id: 'knight',  name: 'Emerald Knight',  emoji: '🛡️', color: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-400', fill: '#10b981' },
  { id: 'archer',  name: 'Ruby Valkyrie',   emoji: '🏹', color: 'rose',    bg: 'bg-rose-500',    text: 'text-rose-600',    ring: 'ring-rose-400',    fill: '#f43f5e' },
  { id: 'mage',    name: 'Sapphire Wizard', emoji: '🔮', color: 'blue',    bg: 'bg-blue-500',    text: 'text-blue-600',    ring: 'ring-blue-400',    fill: '#3b82f6' },
  { id: 'paladin', name: 'Golden Paladin',  emoji: '⚔️', color: 'amber',   bg: 'bg-amber-500',   text: 'text-amber-600',   ring: 'ring-amber-400',   fill: '#f59e0b' },
];

export function getHero(id) {
  return HEROES.find(h => h.id === id) || HEROES[0];
}

// ─── Monster Visuals ───
export const MONSTER_VISUALS = {
  slime:    { emoji: '🟢', label: 'Slime',    color: '#4ade80' },
  goblin:   { emoji: '👾', label: 'Goblin',   color: '#a855f7' },
  dragon:   { emoji: '🐉', label: 'Dragon',   color: '#f97316' },
  skeleton: { emoji: '💀', label: 'Skeleton', color: '#94a3b8' },
  troll:    { emoji: '👹', label: 'Troll',    color: '#92400e' },
};

// ─── Word Bank (kid-friendly, by tier) ───
const WORDS = {
  1: ['CAT','DOG','SUN','RUN','FUN','RED','BIG','HAT','CUP','MAP','PEN','SIT','BOX','FOX','BUG','HUG','TOP','POP','HOP','JET','NET','PET','BED','HEN','TEN','VAN','FAN','PAN','CAN','BAT','RAT','MAT','JAM','HAM','ZIP','TIP','HIT','KIT','BIT','FIT','LOG','FOG','JOG','HOG','COW','OWL','ANT','ELF'],
  2: ['STAR','JUMP','HERO','FIRE','BIRD','FISH','TREE','MOON','CAKE','RAIN','SNOW','FROG','BEAR','WOLF','KING','GAME','PLAY','FAST','SWIM','SHIP','GOLD','BOOK','ROCK','CAVE','PARK','DOOR','BELL','BALL','ROAD','RING','WING','SONG','DUCK','DRUM','LAMP','FLAG','MASK','KITE','GIFT','LION'],
  3: ['MAGIC','WATER','CLOUD','HAPPY','SMILE','BRAVE','LIGHT','STORM','DANCE','DREAM','CROWN','SWORD','FLAME','TOWER','ROBOT','CANDY','GIANT','OCEAN','PLANT','TIGER','HORSE','MOUSE','SNAKE','WHALE','EAGLE','HEART','ARROW','STONE','GUARD','POWER','SPEED','QUEEN','FAIRY','MUSIC','SPARK'],
  4: ['CASTLE','DRAGON','KNIGHT','FOREST','BATTLE','WONDER','GALAXY','PIRATE','WIZARD','SHIELD','JUNGLE','ROCKET','PLANET','FROZEN','BRIDGE','GARDEN','SECRET','GOLDEN','SILVER','KITTEN','RABBIT','MONKEY','TURTLE','COOKIE','BANANA','MIRROR','HELMET','PRINCE','SUNSET','ISLAND'],
};

const MONSTER_TYPES = ['slime','goblin','dragon','skeleton','troll'];

/**
 * Generate a sequence of monsters for a race.
 * @param {number} count Number of monsters
 * @param {number} tier  Word difficulty 1-4
 * @returns {Array<{word:string, type:string}>}
 */
export function generateMonsterSequence(count = 8, tier = 2) {
  // Blend words from the target tier and one below for variety
  const pool = [...(WORDS[tier] || WORDS[2])];
  if (tier > 1) pool.push(...(WORDS[tier - 1] || []));

  const shuffled = pool.sort(() => Math.random() - 0.5);
  const monsters = [];
  for (let i = 0; i < count; i++) {
    monsters.push({
      word: shuffled[i % shuffled.length],
      type: MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)],
    });
  }
  return monsters;
}

/**
 * Generate a unique 4-letter room code.
 * @param {Set<string>} existing Existing codes to avoid
 */
export function generateRoomCode(existing = new Set()) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O to avoid confusion
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (existing.has(code));
  return code;
}

export const TOTAL_MONSTERS = 14;
export const WORD_TIER = 2;

export const RACE_LENGTHS = [
  { id: 'sprint', name: 'Sprint', count: 8, label: 'Short (8 Monsters)' },
  { id: 'standard', name: 'Grand Rescue', count: 14, label: 'Grand Course (14 Monsters)' },
  { id: 'marathon', name: 'Royal Marathon', count: 20, label: 'Epic Marathon (20 Monsters)' }
];
