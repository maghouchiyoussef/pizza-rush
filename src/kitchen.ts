import * as THREE from 'three';
import { CITIES, type City } from './cities';
import { bake, board, cup, parts, pizza } from './food';
import { COUNTER_Y, LAYOUT, type Stage } from './scene';

// The pizzeria stations: 2 prep spots, sauce, cheese, 2 toppings, oven (2 slots), 2 serving boards, drinks.

export const COOK_AT = 5;       // seconds in the oven until golden
export const PERFECT_FOR = 2.4; // golden + shiny window
export const BURN_AT = 11;      // seconds until burnt
const SODA_TIME = 2.2;

export type Quality = 'perfect' | 'ok';
export interface Dog { k: boolean; m: boolean; quality: Quality }   // a pizza: topping A (k), topping B (m)
export type Item = { kind: 'dog'; dog: Dog } | { kind: 'soda' };

interface Prep { group: THREE.Group; sauce: boolean; cheese: boolean; k: boolean; m: boolean }
export interface Baking { mesh: THREE.Group; t: number; k: boolean; m: boolean }
interface Ready { group: THREE.Group; pizza: THREE.Group; k: boolean; m: boolean; quality: Quality }
interface Cup { group: THREE.Group; fill: number }

export type TapResult =
  | 'dough' | 'sauce' | 'cheese' | 'topping' | 'toOven' | 'toBoard' | 'served' | 'trash' | 'sodaStart'
  | 'noSlot' | 'raw' | 'noBoard' | 'noPizza' | 'wrong' | 'busy' | 'nothing';

/** Small bounce animation queue */
const bounces: { obj: THREE.Object3D; t: number; base: number }[] = [];
export function bounce(obj: THREE.Object3D) {
  const ex = bounces.find(b => b.obj === obj);
  if (ex) { ex.t = 0; return; }
  bounces.push({ obj, t: 0, base: obj.scale.y });
}

/** Flying item animation (from its position to another, then callback) */
const flights: { obj: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; arc: number; done?: () => void }[] = [];
function fly(obj: THREE.Object3D, to: THREE.Vector3, dur = 0.3, arc = 0.25, done?: () => void) {
  // a new move replaces any move still running on the same object
  for (let i = flights.length - 1; i >= 0; i--) if (flights[i].obj === obj) flights.splice(i, 1);
  flights.push({ obj, from: obj.position.clone(), to, t: 0, dur, arc, done });
}

const at = ([x, z]: [number, number], y = 0) => new THREE.Vector3(x, COUNTER_Y + y, z);

export class Kitchen {
  prep: (Prep | null)[] = [null, null];
  grill: (Baking | null)[] = [null, null];     // the oven slots (named grill for the cat and tutorial)
  boards: (Ready | null)[] = [null, null];
  cup: Cup | null = null;
  selected = -1;
  sodaEnabled = false;
  city: City = CITIES[0];
  cookSpeed = 1;
  serve: (item: Item) => boolean = () => false;
  private smoke: THREE.Sprite[] = [];
  private smokeTex: THREE.Texture;

  constructor(private stage: Stage) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    this.smokeTex = new THREE.CanvasTexture(c);
  }

  reset(soda: boolean, city: City = this.city) {
    this.city = city;
    const rm = (o?: THREE.Object3D | null) => o && this.stage.scene.remove(o);
    this.prep.forEach(p => rm(p?.group));
    this.grill.forEach(b => rm(b?.mesh));
    this.boards.forEach(b => rm(b?.group));
    rm(this.cup?.group);
    this.prep = [null, null];
    this.grill = [null, null];
    this.boards = [null, null];
    this.cup = null;
    this.selected = -1;
    this.sodaEnabled = soda;
    this.stage.sodaMachine.visible = soda;
    for (const s of this.smoke) this.stage.scene.remove(s);
    this.smoke = [];
  }

  get cookingCount() { return this.grill.filter(Boolean).length; }
  hasBurnt() { return this.grill.some(g => g && g.t >= BURN_AT); }
  hasCooked() { return this.grill.some(g => g && g.t >= COOK_AT && g.t < BURN_AT); }
  hasDog() { return this.boards.some(Boolean); }

  /** Prep spot to use for an ingredient: the selected one if it fits, else the first that fits */
  private target(ok: (p: Prep) => boolean) {
    const s = this.selected;
    if (s >= 0 && this.prep[s] && ok(this.prep[s]!)) return s;
    return this.prep.findIndex(p => p && ok(p));
  }

  tap(id: string): TapResult {
    const { stations } = this.stage;
    if (id === 'dough') {
      bounce(stations.dough);
      const i = this.prep.indexOf(null);
      if (i < 0) return 'noSlot';
      const group = pizza(this.city.sauceColor, this.city.toppings);
      group.position.copy(at(LAYOUT.dough, 0.1));
      group.scale.setScalar(0.4);
      this.stage.scene.add(group);
      fly(group, at(LAYOUT.prep[i], 0.004), 0.3, 0.25, () => { group.scale.setScalar(1.25); bounce(group); });
      this.prep[i] = { group, sauce: false, cheese: false, k: false, m: false };
      this.selected = i;
      return 'dough';
    }
    if (id === 'sauce' || id === 'cheese' || id === 'topA' || id === 'topB') {
      bounce(stations[id]);
      const i = id === 'sauce' ? this.target(p => !p.sauce)
        : id === 'cheese' ? this.target(p => p.sauce && !p.cheese)
        : this.target(p => p.cheese && !(id === 'topA' ? p.k : p.m));
      if (i < 0) return 'noPizza';
      const p = this.prep[i]!;
      const pp = parts(p.group);
      if (id === 'sauce') { p.sauce = true; pp.sauce.visible = true; }
      else if (id === 'cheese') { p.cheese = true; pp.cheese.visible = true; }
      else if (id === 'topA') { p.k = true; pp.tops[0].visible = true; }
      else { p.m = true; pp.tops[1].visible = true; }
      bounce(p.group);
      this.selected = i;
      return id === 'sauce' ? 'sauce' : id === 'cheese' ? 'cheese' : 'topping';
    }
    if (id.startsWith('prep')) {
      const i = +id.slice(4);
      const p = this.prep[i];
      if (!p) return 'nothing';
      this.selected = i;
      if (!p.cheese) { bounce(p.group); return 'noPizza'; }
      const o = this.grill.indexOf(null);
      if (o < 0) { bounce(p.group); return 'noSlot'; }
      this.prep[i] = null;
      this.grill[o] = { mesh: p.group, t: 0, k: p.k, m: p.m };
      fly(p.group, at(LAYOUT.oven[o], 0.052), 0.35, 0.3);
      if (this.selected === i) this.selected = -1;
      return 'toOven';
    }
    if (id.startsWith('oven')) {
      const i = +id.slice(4);
      const b = this.grill[i];
      if (!b) return 'nothing';
      if (b.t >= BURN_AT) {
        this.grill[i] = null;
        fly(b.mesh, b.mesh.position.clone().add(new THREE.Vector3(-1.2, -0.6, 0.8)), 0.4, 0.3, () => this.stage.scene.remove(b.mesh));
        return 'trash';
      }
      if (b.t < COOK_AT) { bounce(b.mesh); return 'raw'; }
      const j = this.boards.indexOf(null);
      if (j < 0) { bounce(b.mesh); return 'noBoard'; }
      this.grill[i] = null;
      const quality: Quality = b.t < COOK_AT + PERFECT_FOR ? 'perfect' : 'ok';
      parts(b.mesh).cheeseMat.emissive.setHex(0);
      parts(b.mesh).cuts.visible = true;
      const group = new THREE.Group();
      const brd = board();
      brd.rotation.y = -Math.PI / 2;     // handle towards the player
      group.add(brd);
      group.position.copy(at(LAYOUT.boards[j]));
      this.stage.scene.add(group);
      group.updateMatrixWorld(true);
      // move the pizza onto the board (keep its world position, then fly)
      const world = b.mesh.position.clone();
      this.stage.scene.remove(b.mesh);
      group.add(b.mesh);
      b.mesh.position.copy(group.worldToLocal(world));
      fly(b.mesh, new THREE.Vector3(0, 0.026, 0), 0.3, 0.2, () => bounce(group));
      this.boards[j] = { group, pizza: b.mesh, k: b.k, m: b.m, quality };
      return 'toBoard';
    }
    if (id.startsWith('board')) {
      const i = +id.slice(5);
      const r = this.boards[i];
      if (!r) return 'nothing';
      const ok = this.serve({ kind: 'dog', dog: { k: r.k, m: r.m, quality: r.quality } });
      if (!ok) { bounce(r.group); return 'wrong'; }
      this.boards[i] = null;
      fly(r.group, r.group.position.clone().add(new THREE.Vector3(0, 0.35, -0.8)), 0.3, 0.3, () => this.stage.scene.remove(r.group));
      return 'served';
    }
    if (id === 'soda') {
      if (!this.sodaEnabled) return 'nothing';
      if (!this.cup) {
        const group = cup(this.city.drinkColor);
        group.position.set(LAYOUT.soda[0], COUNTER_Y + 0.02, LAYOUT.soda[1] + 0.1);
        group.scale.setScalar(1.0);
        this.stage.scene.add(group);
        this.cup = { group, fill: 0 };
        return 'sodaStart';
      }
      if (this.cup.fill < 1) return 'busy';
      const ok = this.serve({ kind: 'soda' });
      if (!ok) { bounce(this.cup.group); return 'wrong'; }
      const c = this.cup;
      this.cup = null;
      fly(c.group, c.group.position.clone().add(new THREE.Vector3(0, 0.3, -0.9)), 0.3, 0.3, () => this.stage.scene.remove(c.group));
      return 'served';
    }
    return 'nothing';
  }

  update(dt: number) {
    for (const b of this.grill) {
      if (!b) continue;
      b.t += dt * this.cookSpeed;
      bake(b.mesh, b.t, COOK_AT, BURN_AT);
      const burning = b.t >= BURN_AT - 1.5;
      if (Math.random() < dt * (burning ? 9 : 2)) this.puff(b.mesh.position, burning);
    }
    if (this.cup && this.cup.fill < 1) {
      this.cup.fill = Math.min(1, this.cup.fill + dt / SODA_TIME);
      const ud = this.cup.group.userData;
      ud.liquid.scale.y = Math.max(0.001, this.cup.fill);
      if (this.cup.fill >= 1) { ud.lid.visible = true; ud.straw.visible = true; bounce(this.cup.group); }
    }
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i];
      s.userData.t += dt;
      const k = s.userData.t / s.userData.life;
      s.position.y += dt * 0.25;
      s.position.x += dt * 0.05;
      s.scale.setScalar(0.06 + k * 0.2);
      (s.material as THREE.SpriteMaterial).opacity = (1 - k) * s.userData.op;
      if (k >= 1) { this.stage.scene.remove(s); this.smoke.splice(i, 1); }
    }
    for (let i = bounces.length - 1; i >= 0; i--) {
      const b = bounces[i];
      b.t += dt;
      const k = Math.min(1, b.t / 0.25);
      b.obj.scale.y = b.base * (1 + Math.sin(k * Math.PI) * 0.14);
      if (k >= 1) { b.obj.scale.y = b.base; bounces.splice(i, 1); }
    }
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i];
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      const e = 1 - (1 - k) * (1 - k);
      f.obj.position.lerpVectors(f.from, f.to, e);
      f.obj.position.y += Math.sin(k * Math.PI) * f.arc;
      if (k >= 1) { flights.splice(i, 1); f.done?.(); }
    }
  }

  private puff(pos: THREE.Vector3, dark: boolean) {
    if (this.smoke.length > 40) return;
    const m = new THREE.SpriteMaterial({ map: this.smokeTex, color: dark ? 0x333333 : 0xffffff, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m);
    s.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.06, (Math.random() - 0.5) * 0.1));
    s.userData = { t: 0, life: 0.9 + Math.random() * 0.5, op: dark ? 0.7 : 0.4 };
    this.stage.scene.add(s);
    this.smoke.push(s);
  }

  /** World position above a station, for the tutorial arrow */
  anchor(id: string): THREE.Vector3 {
    const xz = id === 'dough' ? LAYOUT.dough : id === 'sauce' ? LAYOUT.sauce : id === 'cheese' ? LAYOUT.cheese
      : id === 'topA' ? LAYOUT.topA : id === 'topB' ? LAYOUT.topB : id === 'soda' ? LAYOUT.soda
      : id.startsWith('prep') ? LAYOUT.prep[+id.slice(4)] : id.startsWith('oven') ? LAYOUT.oven[+id.slice(4)]
      : LAYOUT.boards[+id.slice(5)];
    return new THREE.Vector3(xz[0], COUNTER_Y + 0.25, xz[1]);
  }
}
