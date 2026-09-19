# Petch — portfolio cover video

An 8-second, 60fps cover loop built from the **real app UI**, not a screen
recording. Three formats share one timeline:

| File | Use |
|---|---|
| `out/petch-cover-8s-1920x1080.mp4` | 16:9 — site hero, Behance/portfolio cover |
| `out/petch-cover-8s-1080x1080.mp4` | 1:1 — grid thumbnail, Instagram |
| `out/petch-cover-8s-1080x1920.mp4` | 9:16 — story / reel |

Each ships with a `-poster.png` first frame for use as a video poster or a
static fallback.

## Why it loops cleanly

Every animated value is a function of normalised time `u = t / 8` that returns
to its `t = 0` value at `t = 8`:

- the device conveyor travels **exactly one sequence period** (4 screens), so
  at the wrap each slot holds the screen its neighbour held — the strip is
  pixel-identical, just re-labelled;
- per-device bob, tilt, scale and glass sheen are functions of **screen
  position**, not of device index, so a device inherits its neighbour's exact
  state across the wrap;
- the light blooms travel closed ellipses, the dot texture drifts exactly one
  tile, and the mascot plays a whole number of cycles (3 × 75 frames).

Verified: the frame at `t = 0` and the frame at `t = 8` are byte-identical, so
the clip can be cut at 8.000s and looped with no visible seam.

## Why it's smooth

Frames are not captured in real time. `cover.html` exposes `window.setT(seconds)`;
`render.mjs` sets an exact timestamp, screenshots, and pipes the PNG straight
into ffmpeg. No dropped frames, no timing jitter — the conveyor advances the
same ~3px on every one of the 480 frames.

## Regenerating

Needs `ffmpeg` (with libx264), a Chromium build, and `playwright-core`.

```bash
# 1. app screens (writes cover-video/screens/*.png)
cd health-app && npm run build
npx vite preview --port 4317 --strictPort &
node ../cover-video/capture-screens.mjs

# 2. mascot frames — decoded from the app's own idle GIF so the
#    mascot can be advanced deterministically, one PNG per frame
mkdir -p cover-video/pet
ffmpeg -i health-app/src/assets/animation/character-idle.gif \
       -vf scale=550:693:flags=lanczos cover-video/pet/f%03d.png

# 3. fonts
mkdir -p cover-video/fonts && cp health-app/public/fonts/*.otf cover-video/fonts/

# 4. render
cd cover-video && python3 -m http.server 4318 --bind 127.0.0.1 &
node render.mjs 1920 1080 out/petch-cover-8s-1920x1080.mp4
node render.mjs 1080 1080 out/petch-cover-8s-1080x1080.mp4
node render.mjs 1080 1920 out/petch-cover-8s-1080x1920.mp4
```

`pet/` and `fonts/` are derived from assets already in the repo and are not
committed.

## Editing the composition

Everything lives in `cover.html`:

- **`LAYOUT`** — one config block per format (`wide` / `square` / `tall`).
  Horizontal metrics are fractions of width, vertical of height, type sizes of
  the short edge. Change a number here, not the CSS.
- **`SCREENS`** — which captures ride the conveyor, and in what order. Adding a
  fifth screen changes the conveyor period; the loop stays exact because the
  travel distance is derived from `SCREENS.length`.
- **`setT(t)`** — the timeline. Any value added here must close over the loop:
  build it from `sin`/`cos` of `TAU * u`, or from screen position.
- **Copy** — the eyebrow, `#title`, `tagline` and `credit` strings.

## Embedding

```html
<video src="petch-cover-8s-1920x1080.mp4"
       poster="petch-cover-8s-1920x1080-poster.png"
       autoplay muted loop playsinline></video>
```

`muted` and `playsinline` are what let it autoplay on mobile Safari. The clip
has no audio track.
