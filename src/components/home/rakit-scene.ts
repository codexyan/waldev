import {
  BoxGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * Adegan hero "Rakit" (docs/09 §16): tangkapan layar aplikasi terbaru dirakit
 * sebagai kartu 3D. Urutan gerak berjalan sekali; setelah itu kanvas berhenti
 * menggambar dan hanya bangun lagi saat kursor bergerak atau tema berganti.
 *
 * Modul ini hanya dimuat lewat dynamic import dari `hero-rakit.tsx`, sehingga
 * Three.js tidak ikut dalam unduhan awal halaman.
 */

export interface RakitColors {
  /** Sisi kartu. */
  surface: string;
  /** Garis rangka setelah kartu selesai dirakit. */
  line: string;
  /** Garis rangka dan garis pindai selama dirakit. */
  accent: string;
  /** Kepekatan bayangan, 0–1. */
  shadow: number;
}

export interface RakitOptions {
  /** Aplikasi berstatus Sedang dibangun berhenti di tengah perakitan. */
  building: boolean;
  reducedMotion: boolean;
  colors: RakitColors;
}

export interface RakitHandle {
  /** Posisi kursor di atas kanvas, -1 sampai 1 pada kedua sumbu. */
  setPointer(x: number, y: number): void;
  setColors(colors: RakitColors): void;
  resize(): void;
  dispose(): void;
}

const W = 1.6;
const H = 0.9;
const D = 0.028;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const progress = (t: number, from: number, to: number) => clamp((t - from) / (to - from), 0, 1);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Bayangan lembut dari kanvas 2D: persegi digambar di luar bidang, lalu bayangannya digeser masuk. */
function shadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  if (g) {
    g.shadowColor = "rgba(0,0,0,1)";
    g.shadowBlur = 42;
    g.shadowOffsetX = 2000;
    g.fillStyle = "#000";
    g.fillRect((512 - 360) / 2 - 2000, (320 - 190) / 2, 360, 190);
  }
  return new CanvasTexture(canvas);
}

export function mountRakit(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options: RakitOptions,
): RakitHandle {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1.6, 0.1, 50);

  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  // Bidang potong: bagian kartu di bawah garis ini belum "terisi".
  const clip = new Plane(new Vector3(0, 1, 0), -H / 2);
  const box = new BoxGeometry(W, H, D);
  const bodyMat = new MeshBasicMaterial({
    clippingPlanes: [clip],
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const faceMat = new MeshBasicMaterial({ map: texture, clippingPlanes: [clip] });
  const edgeMat = new LineBasicMaterial();
  const scanMat = new MeshBasicMaterial({ transparent: true, opacity: 0 });
  const shadowTex = shadowTexture();
  const shadowMat = new MeshBasicMaterial({
    map: shadowTex,
    color: 0x000000,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const card = new Group();
  const face = new Mesh(new PlaneGeometry(W, H), faceMat);
  face.position.z = D / 2 + 0.001;
  const edges = new LineSegments(new EdgesGeometry(box), edgeMat);
  const scan = new Mesh(new PlaneGeometry(W + 0.05, 0.006), scanMat);
  scan.position.z = D / 2 + 0.004;
  card.add(new Mesh(box, bodyMat), face, edges, scan);

  const shadow = new Mesh(new PlaneGeometry((W * 512) / 360, (H * 320) / 190), shadowMat);
  shadow.position.set(0.05, -0.08, -0.32);
  scene.add(shadow, card);

  const edgeCount = edges.geometry.getAttribute("position").count;
  const accent = new Color();
  const line = new Color();
  let shadowStrength = 0.26;

  function applyColors(colors: RakitColors) {
    bodyMat.color.set(colors.surface);
    accent.set(colors.accent);
    line.set(colors.line);
    scanMat.color.copy(accent);
    shadowStrength = colors.shadow;
  }
  applyColors(options.colors);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const start = performance.now();
  let raf = 0;
  let last = start;

  /** Menata kartu untuk waktu `t` sejak dipasang. Mengembalikan true selama urutan belum selesai. */
  function pose(t: number): boolean {
    const still = options.reducedMotion;
    const edgeP = still ? 1 : easeOut(progress(t, 0, 700));
    edges.geometry.setDrawRange(0, Math.max(2, Math.round((edgeCount * edgeP) / 2) * 2));

    const end = options.building ? 0.46 : 1;
    const reveal = still ? end : easeInOut(progress(t, 420, 1250)) * end;
    const cut = H / 2 - reveal * H;
    clip.constant = reveal >= 1 ? 100 : -cut;
    scan.position.y = cut;
    scanMat.opacity = reveal > 0.001 && reveal < 1 ? 1 : 0;

    const settle = options.building ? 0 : still ? 1 : easeInOut(progress(t, 1050, 1900));
    edgeMat.color.copy(accent).lerp(line, settle);
    card.rotation.x = settle * (-0.11 + pointer.y * 0.06);
    card.rotation.y = settle * (0.2 + pointer.x * 0.08);
    card.position.z = settle * 0.1;
    shadowMat.opacity = shadowStrength * settle;

    return !(still || t > 1950);
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(64, Math.max(0, now - last));
    last = now;
    const k = 1 - Math.exp(-dt / 110);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    const moving = Math.abs(pointer.tx - pointer.x) > 0.002 || Math.abs(pointer.ty - pointer.y) > 0.002;
    const busy = pose(now - start);
    renderer.render(scene, camera);
    if (busy || moving) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 0, Math.max(3, 4.2 / camera.aspect));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    kick();
  }
  resize();

  return {
    setPointer(x, y) {
      if (options.reducedMotion) return;
      pointer.tx = clamp(x, -1, 1);
      pointer.ty = clamp(y, -1, 1);
      kick();
    },
    setColors(colors) {
      applyColors(colors);
      kick();
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) object.geometry.dispose();
      });
      [bodyMat, faceMat, edgeMat, scanMat, shadowMat].forEach((material) => material.dispose());
      texture.dispose();
      shadowTex.dispose();
      renderer.dispose();
    },
  };
}
