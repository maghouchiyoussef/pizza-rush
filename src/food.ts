import * as THREE from 'three';
import type { Topping } from './cities';

// Pizza and drinks, built in code (chunky toy-like shapes).

const mat = (color: number, rough = 0.55, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

const DOUGH_RAW = new THREE.Color(0xf4e6c0), DOUGH_GOLD = new THREE.Color(0xd9963e), DOUGH_BURNT = new THREE.Color(0x2e1d12);
const CHEESE_RAW = new THREE.Color(0xfff6dc), CHEESE_GOLD = new THREE.Color(0xf4c25a), CHEESE_BURNT = new THREE.Color(0x4a2c14);

export const PIZZA_R = 0.16;

/** A pizza (group). Layers appear one by one: sauce, cheese, topping A, topping B. */
export function pizza(sauceColor: number, toppings: [Topping, Topping]) {
  const g = new THREE.Group();
  const doughMat = mat(DOUGH_RAW.getHex(), 0.8);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(PIZZA_R, PIZZA_R * 0.97, 0.018, 36), doughMat);
  base.position.y = 0.009;
  base.castShadow = true; base.receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(PIZZA_R - 0.012, 0.016, 10, 40), doughMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  rim.castShadow = true;
  g.add(base, rim);

  const sauce = new THREE.Mesh(new THREE.CylinderGeometry(PIZZA_R - 0.03, PIZZA_R - 0.03, 0.006, 36), mat(sauceColor, 0.35));
  sauce.position.y = 0.021;
  sauce.visible = false;

  // cheese: a bumpy disc
  const cg = new THREE.CircleGeometry(PIZZA_R - 0.035, 40, 0, Math.PI * 2);
  cg.rotateX(-Math.PI / 2);
  const p = cg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, 0.004 + Math.max(0, Math.sin(x * 60) * Math.cos(z * 55)) * 0.006);
  }
  cg.computeVertexNormals();
  const cheeseMat = mat(CHEESE_RAW.getHex(), 0.5);
  const cheese = new THREE.Mesh(cg, cheeseMat);
  cheese.position.y = 0.022;
  cheese.visible = false;
  g.add(sauce, cheese);

  const tops = toppings.map((t, k) => {
    const grp = new THREE.Group();
    const m = mat(t.color, t.shape === 'disc' ? 0.45 : 0.6);
    const n = t.shape === 'dot' ? 12 : t.shape === 'leaf' ? 6 : 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * 0.4;
      const r = (i % 2 ? 0.055 : 0.095) + (k ? 0.012 : 0);
      let mesh: THREE.Mesh;
      if (t.shape === 'disc') mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.008, 16), m);
      else if (t.shape === 'leaf') {
        const lg = new THREE.SphereGeometry(0.02, 10, 6);
        lg.scale(1.4, 0.25, 0.75);
        mesh = new THREE.Mesh(lg, m);
        mesh.rotation.y = a;
      } else if (t.shape === 'chunk') mesh = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.016, 0.022), m);
      else mesh = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), m);
      mesh.position.set(Math.cos(a) * r, 0.032, Math.sin(a) * r);
      if (t.shape === 'chunk') mesh.rotation.y = a * 1.7;
      mesh.castShadow = true;
      grp.add(mesh);
    }
    grp.visible = false;
    g.add(grp);
    return grp;
  });

  // cut lines (shown when the pizza is out of the oven)
  const cuts = new THREE.Group();
  const cutMat = mat(0x5a3418, 0.9);
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(PIZZA_R * 2 - 0.02, 0.004, 0.005), cutMat);
    c.rotation.y = (i * Math.PI) / 4;
    c.position.y = 0.036;
    cuts.add(c);
  }
  cuts.visible = false;
  g.add(cuts);

  g.userData = { doughMat, cheeseMat, sauce, cheese, tops, cuts };
  return g;
}

export interface PizzaParts {
  doughMat: THREE.MeshStandardMaterial; cheeseMat: THREE.MeshStandardMaterial;
  sauce: THREE.Mesh; cheese: THREE.Mesh; tops: THREE.Group[]; cuts: THREE.Group;
}
export const parts = (g: THREE.Object3D) => g.userData as PizzaParts;

/** Bakes the pizza colors for an oven time (seconds) */
export function bake(g: THREE.Object3D, t: number, cookAt: number, burnAt: number) {
  const { doughMat, cheeseMat } = parts(g);
  if (t < cookAt) {
    const k = t / cookAt;
    doughMat.color.copy(DOUGH_RAW).lerp(DOUGH_GOLD, k);
    cheeseMat.color.copy(CHEESE_RAW).lerp(CHEESE_GOLD, k * 0.7);
  } else if (t < burnAt) {
    const k = Math.max(0, (t - cookAt - 2.2) / (burnAt - cookAt - 2.2)) * 0.55;
    doughMat.color.copy(DOUGH_GOLD).lerp(DOUGH_BURNT, k);
    cheeseMat.color.copy(CHEESE_GOLD).lerp(CHEESE_BURNT, k);
  } else {
    doughMat.color.copy(DOUGH_BURNT);
    cheeseMat.color.copy(CHEESE_BURNT);
  }
  // glossy cheese while perfectly baked
  const perfect = t >= cookAt && t < cookAt + 2.2;
  cheeseMat.emissive.setHex(perfect ? 0x3a2000 : 0x000000);
  cheeseMat.roughness = perfect ? 0.25 : 0.5;
}

/** Wooden serving board */
export function board() {
  const g = new THREE.Group();
  const wood = mat(0xb5793e, 0.75);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 36), wood);
  disc.position.y = 0.012;
  disc.receiveShadow = true;
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 0.05), wood);
  handle.position.set(0.24, 0.012, 0);
  g.add(disc, handle);
  return g;
}

/** Drink cup; returns the group (userData.liquid scale.y = fill 0..1) */
export function cup(liquidColor: number) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.18, 20, 1, true), mat(0xffffff, 0.6, { side: THREE.DoubleSide }));
  body.position.y = 0.09;
  body.castShadow = true;
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0655, 0.06, 0.05, 20, 1, true), mat(0xd6342c, 0.5));
  stripe.position.y = 0.08;
  const liquidGeo = new THREE.CylinderGeometry(0.06, 0.047, 0.17, 20);
  liquidGeo.translate(0, 0.085, 0);
  const liquid = new THREE.Mesh(liquidGeo, mat(liquidColor, 0.2));
  liquid.position.y = 0.005;
  liquid.scale.y = 0.001;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.012, 20), mat(0xf0f0f0, 0.4));
  lid.position.y = 0.185;
  lid.visible = false;
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), mat(0x2e8b3a, 0.4));
  straw.position.set(0.02, 0.24, 0);
  straw.rotation.z = -0.2;
  straw.visible = false;
  grp.add(body, stripe, liquid, lid, straw);
  grp.userData = { liquid, lid, straw };
  return grp;
}

/** Ball of raw dough (in the dough box) */
export function doughBall() {
  const g = new THREE.SphereGeometry(0.06, 18, 12);
  g.scale(1, 0.6, 1);
  const m = new THREE.Mesh(g, mat(0xf4e6c0, 0.85));
  m.castShadow = true;
  return m;
}
