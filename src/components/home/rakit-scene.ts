import {
  AdditiveBlending,
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
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
} from "three";

/**
 * Adegan hero "Rakit" dengan latar Cetak biru (docs/09 §16).
 *
 * Kartu dimulai datar dengan ukuran dan posisi yang sama persis dengan gambar statis di
 * HTML, lalu terangkat dan miring di atas lantai bergaris biru yang menyala dari bawah
 * kartu ke luar. Setelah transisi, garis lantai berdenyut pelan dan titik terang di lantai
 * mengikuti kursor. Render berhenti saat hero tidak terlihat atau tab disembunyikan.
 *
 * Modul ini hanya dimuat lewat dynamic import dari `hero-rakit.tsx`, sehingga Three.js
 * tidak ikut dalam unduhan awal halaman.
 */

export interface RakitColors {
  /** Sisi kartu. */
  surface: string;
  /** Garis tepi kartu setelah transisi. */
  line: string;
  /** Garis lantai, tepi kartu selama transisi, dan tepi kartu aplikasi yang sedang dibangun. */
  accent: string;
  /** Kepekatan bayangan, 0 sampai 1. */
  shadow: number;
  dark: boolean;
}

export interface RakitOptions {
  /** Aplikasi berstatus Sedang dibangun: tepi kartu tetap berwarna aksen. */
  building: boolean;
  /** Kartu tetap datar dan lantai diam. */
  reducedMotion: boolean;
  colors: RakitColors;
}

export interface RakitHandle {
  /** Posisi kursor di atas kanvas, -1 sampai 1 pada kedua sumbu. */
  setPointer(x: number, y: number): void;
  setColors(colors: RakitColors): void;
  /** Hero terlihat di layar atau tidak; saat tidak terlihat, render berhenti. */
  setVisible(visible: boolean): void;
  resize(): void;
  dispose(): void;
}

/** Lebar kartu datar terhadap lebar panggung. Harus sama dengan `md:w-[64%]` pada gambar statis. */
export const CARD_SHARE = 0.64;

const W = 1.6;
const H = 0.9;
const D = 0.028;
const FLOOR_Y = -0.62;
const CAMERA_RISE = 0.34;
const FOV = 28;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const progress = (t: number, from: number, to: number) => clamp((t - from) / (to - from), 0, 1);
/* Smootherstep: kecepatan dan percepatannya nol di awal dan akhir, jadi gerak tidak menyentak. */
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

const WORLD_VERTEX = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const UV_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/* Garis minor tiap 0,2 unit dan mayor tiap 0,8 unit, memudar menjauhi kartu. `uReveal` adalah
   jari-jari garis yang sudah menyala; `colorspace_fragment` menyamakan warna dengan CSS. */
const GRID_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uReveal;
uniform vec2 uPointer;
uniform float uTime;
uniform float uOpacity;
varying vec3 vW;
float gridLine(vec2 c) {
  vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
  return 1.0 - min(min(g.x, g.y), 1.0);
}
void main() {
  vec2 p = vW.xz;
  float minor = gridLine(p * 5.0);
  float major = gridLine(p * 1.25);
  float d = length(p * vec2(0.75, 1.15));
  float fade = 1.0 - smoothstep(0.5, 3.4, d);
  float reveal = 1.0 - smoothstep(uReveal - 0.9, uReveal, d);
  float spot = 1.0 - smoothstep(0.0, 1.2, length(p - uPointer));
  float wave = 0.82 + 0.18 * sin(uTime * 1.1 - d * 3.2);
  float alpha = (minor * 0.2 + major * 0.6) * fade * reveal * (0.5 + 0.8 * spot) * wave * uOpacity;
  gl_FragColor = vec4(uColor, alpha);
  #include <colorspace_fragment>
}`;

/* Kilau tipis yang menyapu muka kartu sekali selama transisi. */
const SHEEN_FRAGMENT = /* glsl */ `
uniform float uPos;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float x = vUv.x * 0.8 + (1.0 - vUv.y) * 0.4;
  float band = 1.0 - smoothstep(0.0, 0.16, abs(x - uPos));
  gl_FragColor = vec4(vec3(1.0), band * uStrength);
  #include <colorspace_fragment>
}`;

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
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1.6, 0.05, 60);

  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  /* Kartu */
  const box = new BoxGeometry(W, H, D);
  const bodyMat = new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const faceMat = new MeshBasicMaterial({ map: texture });
  const edgeMat = new LineBasicMaterial();
  // Objek uniform disimpan terpisah supaya aksesnya bertipe; ShaderMaterial memakai referensi yang sama.
  const sheenUniforms = { uPos: { value: -1 }, uStrength: { value: 0 } };
  const sheenMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: sheenUniforms,
    vertexShader: UV_VERTEX,
    fragmentShader: SHEEN_FRAGMENT,
  });
  const card = new Group();
  const face = new Mesh(new PlaneGeometry(W, H), faceMat);
  face.position.z = D / 2 + 0.001;
  const edges = new LineSegments(new EdgesGeometry(box), edgeMat);
  const sheen = new Mesh(new PlaneGeometry(W, H), sheenMat);
  sheen.position.z = D / 2 + 0.003;
  card.add(new Mesh(box, bodyMat), face, edges, sheen);

  /* Lantai cetak biru dan bayangan kartu di atasnya */
  const gridUniforms = {
    uColor: { value: new Color() },
    uReveal: { value: 0 },
    uPointer: { value: new Vector2() },
    uTime: { value: 0 },
    uOpacity: { value: 0.8 },
  };
  const gridMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: gridUniforms,
    vertexShader: WORLD_VERTEX,
    fragmentShader: GRID_FRAGMENT,
  });
  const floor = new Mesh(new PlaneGeometry(14, 14), gridMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  const shadowTex = shadowTexture();
  const blobMat = new MeshBasicMaterial({ map: shadowTex, color: 0x000000, transparent: true, opacity: 0, depthWrite: false });
  const blob = new Mesh(new PlaneGeometry(2.1, 1.2), blobMat);
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(0.08, FLOOR_Y + 0.002, 0.1);
  scene.add(floor, blob, card);

  const edgeCount = edges.geometry.getAttribute("position").count;
  const accent = new Color();
  const line = new Color();
  let shadowStrength = 0.26;
  let dark = false;

  function applyColors(colors: RakitColors) {
    bodyMat.color.set(colors.surface);
    accent.set(colors.accent);
    line.set(colors.line);
    gridUniforms.uColor.value.set(colors.accent);
    gridUniforms.uOpacity.value = colors.dark ? 1 : 0.8;
    shadowStrength = colors.shadow;
    dark = colors.dark;
  }
  applyColors(options.colors);

  // Shader dan gambar disiapkan sebelum frame pertama. Kompilasi shader bisa makan ratusan
  // milidetik di GPU laptop; bila terjadi di frame pertama, awal transisi ikut terlewat.
  renderer.compile(scene, camera);
  renderer.initTexture(texture);

  const still = options.reducedMotion;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  /** Waktu frame pertama; jam transisi baru berjalan setelah kartu benar-benar tergambar. */
  let start = -1;
  let raf = 0;
  let last = performance.now();
  let visible = true;

  /** Menata adegan untuk waktu `t` sejak dipasang. True selama transisi belum selesai. */
  function pose(t: number, now: number): boolean {
    const lift = still ? 0 : smoother(progress(t, 250, 1650));
    const drawn = still ? 1 : smoother(progress(t, 120, 1000));
    edges.geometry.setDrawRange(0, Math.max(2, Math.round((edgeCount * drawn) / 2) * 2));
    const cool = options.building ? 0 : still ? 1 : smoother(progress(t, 1100, 1900));
    edgeMat.color.copy(accent).lerp(line, cool);

    const sweep = still ? 0 : progress(t, 500, 1450);
    sheenUniforms.uPos.value = lerp(-0.35, 1.45, smoother(sweep));
    sheenUniforms.uStrength.value = (dark ? 0.2 : 0.14) * Math.sin(Math.PI * sweep);

    card.rotation.x = lift * (-0.1 + pointer.y * 0.05);
    card.rotation.y = lift * (0.22 + pointer.x * 0.07);
    card.position.z = lift * 0.12;
    const rise = CAMERA_RISE * lift;
    camera.position.y = rise;
    camera.lookAt(0, -rise * 0.2, 0);

    gridUniforms.uReveal.value = (still ? 1 : smoother(progress(t, 200, 1700))) * 4.6;
    gridUniforms.uTime.value = still ? 0 : now / 1000;
    gridUniforms.uPointer.value.set(pointer.x * 1.6, 0.25 + pointer.y * 0.9);
    blobMat.opacity = shadowStrength * (still ? 0.5 : lift * 0.9);

    return !still && t < 1950;
  }

  function frame(now: number) {
    raf = 0;
    if (start < 0) start = now;
    const dt = Math.min(64, Math.max(0, now - last));
    last = now;
    const k = 1 - Math.exp(-dt / 140);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    const moving = Math.abs(pointer.tx - pointer.x) > 0.002 || Math.abs(pointer.ty - pointer.y) > 0.002;
    const busy = pose(now - start, now);
    renderer.render(scene, camera);
    // Lantai terus berdenyut selama hero terlihat. Dengan gerak dikurangi, render berhenti setelah diam.
    if (visible && !document.hidden && (busy || moving || !still)) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const onVisibility = () => kick();
  document.addEventListener("visibilitychange", onVisibility);

  /* Kamera diatur supaya kartu datar selebar CARD_SHARE panggung, sama dengan gambar statisnya. */
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const visibleHeight = W / CARD_SHARE / camera.aspect;
    camera.position.z = visibleHeight / 2 / Math.tan((FOV * Math.PI) / 360);
    camera.updateProjectionMatrix();
    kick();
  }
  resize();

  return {
    setPointer(x, y) {
      if (still) return;
      pointer.tx = clamp(x, -1, 1);
      pointer.ty = clamp(y, -1, 1);
      kick();
    },
    setColors(colors) {
      applyColors(colors);
      kick();
    },
    setVisible(next) {
      visible = next;
      kick();
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) object.geometry.dispose();
      });
      [bodyMat, faceMat, edgeMat, sheenMat, gridMat, blobMat].forEach((material) => material.dispose());
      texture.dispose();
      shadowTex.dispose();
      renderer.dispose();
    },
  };
}
