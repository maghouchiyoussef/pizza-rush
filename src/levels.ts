import { CITIES } from './cities';

// Levels: 10 per city, getting harder. Level 1 of the first city has the tutorial.

export interface LevelDef {
  id: string;
  city: string;
  n: number;              // 1..10 inside the city
  index: number;          // global index
  duration: number;       // seconds
  target: number;         // coins for 1 star
  sauces: ('k' | 'm')[];  // sauces that can appear in orders
  soda: boolean;
  spawnEvery: number;     // seconds between customers
  patience: number;       // seconds a customer waits
  maxCustomers: number;   // spots at the counter (1-3)
}

export const PER_CITY = 10;

function makeLevels(): LevelDef[] {
  const out: LevelDef[] = [];
  CITIES.forEach((city, ci) => {
    for (let n = 1; n <= PER_CITY; n++) {
      const d = ci * 0.6 + n;          // overall difficulty
      const first = ci === 0;
      const sauces: ('k' | 'm')[] = first && n === 1 ? ['k'] : ['k', 'm'];
      const soda = !(first && n < 3) && !(ci > 0 && n === 1);
      const maxCustomers = first && n === 1 ? 2 : 3;
      const duration = Math.min(120, 75 + n * 4);
      const spawnEvery = Math.max(5, 10.5 - d * 0.45);
      const patience = Math.max(24, 42 - d * 1.2);
      // money a good player can make: roughly one order every spawnEvery seconds
      const perOrder = 10 + (soda ? 1.6 : 0);
      const target = Math.round((duration / spawnEvery) * perOrder * 0.55 / 5) * 5;
      out.push({ id: `${city.id}-${n}`, city: city.id, n, index: out.length, duration, target, sauces, soda, spawnEvery, patience, maxCustomers });
    }
  });
  return out;
}

export const LEVELS = makeLevels();

export const PRICE = { dog: 8, sauce: 2, soda: 3, perfect: 2 };   // pizza, each topping, drink, perfect bake bonus

export function starsFor(def: LevelDef, money: number) {
  if (money >= def.target * 1.6) return 3;
  if (money >= def.target * 1.3) return 2;
  if (money >= def.target) return 1;
  return 0;
}
