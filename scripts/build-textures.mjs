// Builds the globe textures (height, normal, albedo) at 4K and 2K.
//
// Sources (both public domain):
//  - scripts/source/earth-topology.png — NASA Visible Earth "Topography"
//    (SRTM/RAMP2 elevation, 2048x1024), as redistributed in the three-globe package.
//  - world-atlas land-10m — Natural Earth 1:10m land polygons.
//
// Run: npm run textures
import sharp from 'sharp'
import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { readFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'public/textures')
mkdirSync(out, { recursive: true })

const W = 4096
const H = 2048

// --- land mask from Natural Earth vectors -----------------------------------
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-10m.json'), 'utf8'))
const land = feature(topo, topo.objects.land)
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2])
const d = geoPath(projection)(land)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/><path d="${d}" fill="#fff"/></svg>`
const gray = async (img) => new Float32Array(await img.greyscale().raw().toBuffer()).map((v) => v / 255)
const toImg = (f) => sharp(Buffer.from(Uint8Array.from(f, (v) => Math.max(0, Math.min(255, Math.round(v * 255))))), { raw: { width: W, height: H, channels: 1 } })
const blur = async (f, sigma) => gray(toImg(f).blur(sigma))

const maskSharp = await gray(sharp(Buffer.from(svg), { limitInputPixels: false }).resize(W, H))
const mask = await blur(maskSharp, 1.6) // soft bevel at the coast

// --- elevation --------------------------------------------------------------
const elev = await gray(sharp(path.join(root, 'scripts/source/earth-topology.png')).resize(W, H, { kernel: 'cubic' }))

// Exaggerated relief: land sits on a plateau above the flat ocean, and a
// gamma curve lifts low/mid elevations so hills read at a distance.
const PLATEAU = 0.3
const height = new Float32Array(W * H)
for (let i = 0; i < height.length; i++) {
  const e = Math.pow(elev[i], 0.55)
  height[i] = mask[i] * (PLATEAU + (1 - PLATEAU) * e)
}

// --- normal map (tangent space, OpenGL convention) --------------------------
const STRENGTH = 20
const normal = Buffer.alloc(W * H * 3)
for (let y = 0; y < H; y++) {
  const lat = (0.5 - (y + 0.5) / H) * Math.PI
  const cosLat = Math.max(Math.cos(lat), 0.15) // pixels shrink east-west toward the poles
  const yu = Math.max(y - 1, 0)
  const yd = Math.min(y + 1, H - 1)
  for (let x = 0; x < W; x++) {
    const xl = (x - 1 + W) % W
    const xr = (x + 1) % W
    const dx = ((height[y * W + xr] - height[y * W + xl]) / cosLat) * STRENGTH
    const dy = (height[yu * W + x] - height[yd * W + x]) * STRENGTH // +y = north
    const inv = 1 / Math.hypot(dx, dy, 1)
    const i = (y * W + x) * 3
    normal[i] = Math.round((-dx * inv * 0.5 + 0.5) * 255)
    normal[i + 1] = Math.round((-dy * inv * 0.5 + 0.5) * 255)
    normal[i + 2] = Math.round((inv * 0.5 + 0.5) * 255)
  }
}

// --- albedo: near-white land, slightly darker ocean, baked soft cavity shading
const wide = await blur(height, 14)
const LAND = [0.975, 0.972, 0.98]
const OCEAN = [0.75, 0.76, 0.83]
const albedo = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  const m = mask[i]
  const cavity = Math.max(-0.22, Math.min(0.06, (height[i] - wide[i]) * 1.1))
  // contact shadow on the ocean right next to the coast
  const shore = (1 - m) * Math.min(1, wide[i] * 2.2) * 0.16
  for (let c = 0; c < 3; c++) {
    const base = OCEAN[c] + (LAND[c] - OCEAN[c]) * m
    albedo[i * 3 + c] = Math.max(0, Math.min(255, Math.round(base * (1 + cavity * m - shore) * 255)))
  }
}

// --- write ------------------------------------------------------------------
for (const [suffix, w] of [['4k', 4096], ['2k', 2048]]) {
  const h = w / 2
  await toImg(height).resize(w, h).png({ compressionLevel: 9 }).toFile(path.join(out, `earth-height-${suffix}.png`))
  await sharp(normal, { raw: { width: W, height: H, channels: 3 } }).resize(w, h).webp({ quality: 92 }).toFile(path.join(out, `earth-normal-${suffix}.webp`))
  await sharp(albedo, { raw: { width: W, height: H, channels: 3 } }).resize(w, h).webp({ quality: 90 }).toFile(path.join(out, `earth-albedo-${suffix}.webp`))
}
console.log('textures written to', out)
