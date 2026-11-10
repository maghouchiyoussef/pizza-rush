import type { Lang } from './save';

// The six pizza cities: each one has its own toppings, drink, pizzeria colors and background.

export type ToppingShape = 'disc' | 'leaf' | 'chunk' | 'dot';
export interface Topping { shape: ToppingShape; color: number }

export interface City {
  id: string;
  name: Record<Lang, string>;
  flag: string;
  bg: string;
  dish: string;            // emoji in the order bubble
  drink: string;           // emoji in the order bubble
  toppings: [Topping, Topping];
  sauces: [number, number];               // chip colors of topping A and B in the order bubble
  sauceColor: number;                     // pizza sauce
  drinkColor: number;
  cart: { body: number; trim: number; awning: [number, number]; machine: number };
  sky: number;             // fog / clear color
}

const chips = (a: Topping, b: Topping): [number, number] => [a.color, b.color];

const NAP_T: [Topping, Topping] = [{ shape: 'leaf', color: 0x3f9a3a }, { shape: 'dot', color: 0x26201c }];
const NYC_T: [Topping, Topping] = [{ shape: 'disc', color: 0xc0392b }, { shape: 'chunk', color: 0xd8c3a0 }];
const TYO_T: [Topping, Topping] = [{ shape: 'dot', color: 0xf5c518 }, { shape: 'chunk', color: 0x8a4a22 }];
const IST_T: [Topping, Topping] = [{ shape: 'disc', color: 0x8e2a1e }, { shape: 'leaf', color: 0x6cb33a }];
const BOM_T: [Topping, Topping] = [{ shape: 'chunk', color: 0xf3ead8 }, { shape: 'leaf', color: 0xc8281e }];
const RIO_T: [Topping, Topping] = [{ shape: 'chunk', color: 0xf0b8b0 }, { shape: 'dot', color: 0x3a3a2a }];

export const CITIES: City[] = [
  {
    id: 'nap', flag: '🇮🇹', bg: 'img/nap.jpg', dish: '🍕', drink: '🥤',
    name: { en: 'Naples', fr: 'Naples', es: 'Nápoles', ar: 'نابولي' },
    toppings: NAP_T, sauces: chips(...NAP_T), sauceColor: 0xc8281e, drinkColor: 0xf2d24a,
    cart: { body: 0x2e8b3a, trim: 0xd8c08a, awning: [0x2e8b3a, 0xffffff], machine: 0xc8281e }, sky: 0xf4a46a,
  },
  {
    id: 'nyc', flag: '🗽', bg: 'img/nyc.jpg', dish: '🍕', drink: '🥤',
    name: { en: 'New York', fr: 'New York', es: 'Nueva York', ar: 'نيويورك' },
    toppings: NYC_T, sauces: chips(...NYC_T), sauceColor: 0xd23a22, drinkColor: 0x5a2a10,
    cart: { body: 0xd6342c, trim: 0xc8ccd2, awning: [0xd6342c, 0xffffff], machine: 0x1e63c9 }, sky: 0xf4a46a,
  },
  {
    id: 'tyo', flag: '🏮', bg: 'img/tyo.jpg', dish: '🍕', drink: '🍵',
    name: { en: 'Tokyo', fr: 'Tokyo', es: 'Tokio', ar: 'طوكيو' },
    toppings: TYO_T, sauces: chips(...TYO_T), sauceColor: 0xd8502a, drinkColor: 0x7aa83a,
    cart: { body: 0x2a2a3a, trim: 0xc89a5a, awning: [0x2a3a6a, 0xf4ecdc], machine: 0xc8302a }, sky: 0x8a7ab8,
  },
  {
    id: 'ist', flag: '🕌', bg: 'img/ist.jpg', dish: '🍕', drink: '🥛',
    name: { en: 'Istanbul', fr: 'Istanbul', es: 'Estambul', ar: 'إسطنبول' },
    toppings: IST_T, sauces: chips(...IST_T), sauceColor: 0xc83a22, drinkColor: 0xfafaf2,
    cart: { body: 0x1e5aa8, trim: 0xe8c04a, awning: [0xc8202a, 0xffffff], machine: 0x2a8a5a }, sky: 0xf2a070,
  },
  {
    id: 'bom', flag: '🛺', bg: 'img/bom.jpg', dish: '🍕', drink: '🥭',
    name: { en: 'Mumbai', fr: 'Mumbai', es: 'Bombay', ar: 'مومباي' },
    toppings: BOM_T, sauces: chips(...BOM_T), sauceColor: 0xe0602a, drinkColor: 0xf6a22a,
    cart: { body: 0xe8a020, trim: 0x2a8a6a, awning: [0xe8447a, 0xf6d23a], machine: 0x1fa58a }, sky: 0xf6b980,
  },
  {
    id: 'rio', flag: '🏝️', bg: 'img/rio.jpg', dish: '🍕', drink: '🧃',
    name: { en: 'Rio de Janeiro', fr: 'Rio de Janeiro', es: 'Río de Janeiro', ar: 'ريو دي جانيرو' },
    toppings: RIO_T, sauces: chips(...RIO_T), sauceColor: 0xc8281e, drinkColor: 0x9ad03a,
    cart: { body: 0x1fa58a, trim: 0xf2b134, awning: [0x22a04a, 0xf7d23a], machine: 0x1e63c9 }, sky: 0x7ac8e8,
  },
];

export const cityOf = (id: string) => CITIES.find(c => c.id === id) ?? CITIES[0];
