import * as THREE from 'three';
import type { City, Topping } from './cities';
import { doughBall } from './food';

// Renderer, camera, lights, the street background and the pizzeria counter.

export const COUNTER_Y = 1.0;
type XZ = [number, number];
/** Layout of the stations on the counter (x, z). Ingredients near the player, oven near the customers. */
export const LAYOUT = {
  dough: [-0.72, 1.95] as XZ,
  sauce: [-0.34, 1.95] as XZ,
  cheese: [0.04, 1.95] as XZ,
  soda: [0.62, 1.1] as XZ,
  prep: [[-0.52, 1.15], [0.0, 1.15]] as XZ[],
  topA: [0.4, 1.97] as XZ,
  topB: [0.74, 1.97] as XZ,
  oven: [[-0.6, 0.36], [-0.14, 0.36]] as XZ[],
  boards: [[0.32, 0.32], [0.74, 0.32]] as XZ[],
  customers: [-0.72, 0, 0.72],
  customerZ: -0.48,
};

const mat = (color: number, rough = 0.6, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  hits: THREE.Object3D[];      // tappable invisible boxes (userData.hit = id)
  stations: Record<string, THREE.Object3D>;   // visual objects to bounce on tap
  sodaMachine: THREE.Group;
  setCity(city: City): void;
  setBackground(tex: THREE.Texture): void;
  resize(): void;
}

function hitBox(id: string, w: number, h: number, d: number, x: number, y: number, z: number, hits: THREE.Object3D[], parent: THREE.Object3D) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z);
  m.userData.hit = id;
  parent.add(m);
  hits.push(m);
  return m;
}

function bowl(color: number, r = 0.13) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.75, 0.08, 24, 1, true), mat(color, 0.4, { side: THREE.DoubleSide }));
  b.position.y = 0.04;
  b.castShadow = true;
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(r * 0.75, 24), mat(color, 0.4));
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.002;
  g.add(b, bottom);
  return g;
}

/** A pile of topping pieces for a topping bowl */
function toppingPile(t: Topping) {
  const g = new THREE.Group();
  const m = mat(t.color, 0.55);
  for (let i = 0; i < 9; i++) {
    let mesh: THREE.Mesh;
    if (t.shape === 'disc') mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 14), m);
    else if (t.shape === 'leaf') { const lg = new THREE.SphereGeometry(0.026, 10, 6); lg.scale(1.4, 0.3, 0.75); mesh = new THREE.Mesh(lg, m); }
    else if (t.shape === 'chunk') mesh = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.02, 0.028), m);
    else mesh = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), m);
    const a = i * 2.4, r = 0.025 + (i % 3) * 0.028;
    mesh.position.set(Math.cos(a) * r, 0.05 + (i % 2) * 0.012, Math.sin(a) * r);
    mesh.rotation.set(i * 0.7, i, i * 0.3);
    g.add(mesh);
  }
  return g;
}

export function createStage(canvas: HTMLCanvasElement): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4a46a);
  scene.fog = new THREE.Fog(0xf4a46a, 9, 22);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 60);
  const hits: THREE.Object3D[] = [];
  const stations: Record<string, THREE.Object3D> = {};

  // Lights: warm key light + soft sky fill
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x6a4a5a, 1.25));
  const sun = new THREE.DirectionalLight(0xffd2a0, 2.4);
  sun.position.set(-3, 6, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2.5, bottom: -2, near: 1, far: 15 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Painted background (set later with setBackground)
  const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bg.position.set(0, 1.7, -7);
  bg.visible = false;
  scene.add(bg);

  // ---------- The pizzeria counter ----------
  const cart = new THREE.Group();
  scene.add(cart);
  const trimMat = mat(0xc8ccd2, 0.28, { metalness: 0.8 });
  const bodyMat = mat(0xd6342c, 0.45);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 3.7), mat(0xe8dcc8, 0.5));   // marble-ish
  top.position.set(0, COUNTER_Y - 0.03, 1.72);
  top.receiveShadow = true;
  cart.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(2.4, COUNTER_Y - 0.06, 0.05), bodyMat);
  front.position.set(0, (COUNTER_Y - 0.06) / 2, -0.12);
  cart.add(front);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.05, 0.08), trimMat);
  trim.position.set(0, COUNTER_Y - 0.08, -0.13);
  cart.add(trim);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 1.0), mat(0xb98a5a, 0.75));
  board.position.set(0, COUNTER_Y + 0.02, 2.8);
  board.receiveShadow = true;
  cart.add(board);

  // Oven: stone deck with a low brick arch behind it and glowing embers
  const oven = new THREE.Group();
  oven.position.set(-0.37, COUNTER_Y, 0.34);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.5), mat(0x6a6460, 0.9));
  deck.position.y = 0.025;
  deck.receiveShadow = true;
  const embers = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.01, 0.46), mat(0x200000, 1, { emissive: 0xff5a10, emissiveIntensity: 0.25 }));
  embers.position.y = 0.052;
  const brick = mat(0xb5532e, 0.85);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 32, 1, false, -Math.PI / 2, Math.PI), brick);
  arch.rotation.x = -Math.PI / 2;
  arch.scale.set(1, 1, 0.55);
  arch.position.set(0, 0.06, -0.28);
  const archFire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.122, 32, 1, false, -Math.PI / 2, Math.PI),
    mat(0x200000, 1, { emissive: 0xff7a20, emissiveIntensity: 0.9 }));
  archFire.rotation.x = -Math.PI / 2;
  archFire.scale.set(1, 1, 0.48);
  archFire.position.set(0, 0.06, -0.27);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.03, 0.06), brick);
  lip.position.set(0, 0.04, 0.26);
  oven.add(deck, embers, arch, archFire, lip);
  oven.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
  cart.add(oven);
  LAYOUT.oven.forEach(([x, z], i) => hitBox(`oven${i}`, 0.42, 0.25, 0.42, x, COUNTER_Y + 0.08, z, hits, scene));

  // Serving boards spots (the boards with pizzas are created by the kitchen)
  LAYOUT.boards.forEach(([x, z], i) => {
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), mat(0xd8ccb8, 0.9));
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(x, COUNTER_Y + 0.002, z);
    cart.add(spot);
    hitBox(`board${i}`, 0.42, 0.25, 0.42, x, COUNTER_Y + 0.08, z, hits, scene);
  });

  // Prep spots (flour dusted)
  LAYOUT.prep.forEach(([x, z], i) => {
    const flour = new THREE.Mesh(new THREE.CircleGeometry(0.21, 32), mat(0xfaf6ee, 1));
    flour.rotation.x = -Math.PI / 2;
    flour.position.set(x, COUNTER_Y + 0.003, z);
    cart.add(flour);
    hitBox(`prep${i}`, 0.44, 0.25, 0.44, x, COUNTER_Y + 0.08, z, hits, scene);
  });

  // Dough box
  const doughBox = new THREE.Group();
  doughBox.position.set(LAYOUT.dough[0], COUNTER_Y, LAYOUT.dough[1]);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.32), mat(0xb07a45, 0.8));
  box.position.y = 0.03;
  box.castShadow = true;
  doughBox.add(box);
  [[-0.09, -0.07], [0.09, -0.07], [-0.09, 0.08], [0.09, 0.08]].forEach(([x, z]) => {
    const d = doughBall();
    d.position.set(x, 0.08, z);
    doughBox.add(d);
  });
  doughBox.scale.setScalar(1.0);
  cart.add(doughBox);
  stations.dough = doughBox;
  hitBox('dough', 0.46, 0.3, 0.42, LAYOUT.dough[0], COUNTER_Y + 0.1, LAYOUT.dough[1], hits, scene);

  // Sauce pot with ladle
  const saucePot = new THREE.Group();
  saucePot.position.set(LAYOUT.sauce[0], COUNTER_Y, LAYOUT.sauce[1]);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.12, 24, 1, true), trimMat);
  pot.position.y = 0.06;
  pot.castShadow = true;
  const sauceTop = new THREE.Mesh(new THREE.CircleGeometry(0.115, 24), mat(0xc8281e, 0.3));
  sauceTop.rotation.x = -Math.PI / 2;
  sauceTop.position.y = 0.1;
  const ladle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), trimMat);
  ladle.position.set(0.05, 0.17, 0);
  ladle.rotation.z = -0.5;
  saucePot.add(pot, sauceTop, ladle);
  saucePot.scale.setScalar(1.1);
  cart.add(saucePot);
  stations.sauce = saucePot;
  hitBox('sauce', 0.34, 0.35, 0.34, LAYOUT.sauce[0], COUNTER_Y + 0.12, LAYOUT.sauce[1], hits, scene);

  // Cheese bowl
  const cheeseBowl = bowl(0x3d8bd9, 0.13);
  cheeseBowl.position.set(LAYOUT.cheese[0], COUNTER_Y, LAYOUT.cheese[1]);
  const shredMat = mat(0xfff0b8, 0.6);
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.008), shredMat);
    const a = i * 2.3, r = (i % 5) * 0.022;
    s.position.set(Math.cos(a) * r, 0.06 + (i % 3) * 0.008, Math.sin(a) * r);
    s.rotation.y = a * 1.3;
    cheeseBowl.add(s);
  }
  cheeseBowl.scale.setScalar(1.1);
  cart.add(cheeseBowl);
  stations.cheese = cheeseBowl;
  hitBox('cheese', 0.36, 0.3, 0.36, LAYOUT.cheese[0], COUNTER_Y + 0.1, LAYOUT.cheese[1], hits, scene);

  // Topping bowls (contents set per city)
  const topBowls = [LAYOUT.topA, LAYOUT.topB].map(([x, z], i) => {
    const b = bowl(0xf2efe8, 0.12);
    b.position.set(x, COUNTER_Y, z);
    b.scale.setScalar(1.05);
    cart.add(b);
    const id = i ? 'topB' : 'topA';
    stations[id] = b;
    hitBox(id, 0.32, 0.3, 0.32, x, COUNTER_Y + 0.1, z, hits, scene);
    const fill = new THREE.Group();
    b.add(fill);
    return fill;
  });

  // Drink machine
  const sodaMachine = new THREE.Group();
  sodaMachine.position.set(LAYOUT.soda[0], COUNTER_Y, LAYOUT.soda[1]);
  const machineMat = mat(0x1e63c9, 0.4);
  const mbox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.22), machineMat);
  mbox.position.set(0, 0.25 + 0.12, -0.06);
  mbox.castShadow = true;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.01), mat(0xffffff, 0.3, { emissive: 0x6fb7ff, emissiveIntensity: 0.6 }));
  panel.position.set(0, 0.5, 0.055);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.05, 10), trimMat);
  nozzle.position.set(0, 0.32, 0.06);
  const drip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.18), trimMat);
  drip.position.set(0, 0.01, 0.06);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.08), machineMat);
  legs.position.set(0, 0.06, -0.13);
  sodaMachine.add(mbox, panel, nozzle, drip, legs);
  sodaMachine.scale.setScalar(0.8);
  cart.add(sodaMachine);
  hitBox('soda', 0.36, 0.55, 0.36, LAYOUT.soda[0], COUNTER_Y + 0.25, LAYOUT.soda[1] + 0.05, hits, scene);

  // Striped awning edge at the top of the view (frames the screen)
  const awning = new THREE.Group();
  const stripeW = 0.25;
  const awningMats = [mat(0xd6342c, 0.7, { side: THREE.DoubleSide }), mat(0xffffff, 0.7, { side: THREE.DoubleSide })];
  for (let i = -8; i < 8; i++) {
    const g = new THREE.CylinderGeometry(stripeW / 2, stripeW / 2, 0.04, 16, 1, false, 0, Math.PI);
    const scallop = new THREE.Mesh(g, awningMats[Math.abs(i) % 2]);
    scallop.rotation.set(Math.PI / 2, 0, 0);
    scallop.position.set((i + 0.5) * stripeW, 0, 0);
    const panelS = new THREE.Mesh(new THREE.BoxGeometry(stripeW, 0.5, 0.03), scallop.material);
    panelS.position.set((i + 0.5) * stripeW, 0.25, 0);
    awning.add(scallop, panelS);
  }
  awning.position.set(0, 3.0, -0.6);
  scene.add(awning);

  const stage: Stage = {
    renderer, scene, camera, hits, stations, sodaMachine,
    setCity(city) {
      bodyMat.color.setHex(city.cart.body);
      trimMat.color.setHex(city.cart.trim);
      awningMats[0].color.setHex(city.cart.awning[0]);
      awningMats[1].color.setHex(city.cart.awning[1]);
      machineMat.color.setHex(city.cart.machine);
      (sauceTop.material as THREE.MeshStandardMaterial).color.setHex(city.sauceColor);
      (scene.background as THREE.Color).setHex(city.sky);
      scene.fog!.color.setHex(city.sky);
      topBowls.forEach((fill, i) => { fill.clear(); fill.add(toppingPile(city.toppings[i])); });
    },
    setBackground(tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      bgMat.map = tex; bgMat.needsUpdate = true;
      const a = (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height;
      bg.scale.set(11 * a, 11, 1);
      bg.visible = true;
    },
    resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // Keep the whole counter visible on narrow phones
      const dist = 2.9;
      const vfov = THREE.MathUtils.radToDeg(2 * Math.atan(1.12 / (dist * aspect)));
      camera.fov = THREE.MathUtils.clamp(vfov, 45, 76);
      // on less tall phones (16:9) look a bit higher so the order bubbles stay below the top bar
      const k = THREE.MathUtils.clamp((aspect - 0.46) / 0.1, 0, 1);
      camera.position.set(0, 3.2, 2.95);
      camera.lookAt(0, 0.95 + 0.3 * k, 0.82 - 0.25 * k);
      camera.updateProjectionMatrix();
    },
  };
  stage.resize();
  return stage;
}
