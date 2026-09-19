# Petch — portfolio cover video

An 8-second, 60fps cover loop in the visual language of the original Petch
film: flat brand cyan, big white kinetic type, real UI components at scale.
No device mockups, no gradients, no gloss.

| File | Use |
|---|---|
| `out/petch-cover-8s-1920x1080.mp4` | 16:9 — site hero, Behance/portfolio cover |
| `out/petch-cover-8s-1080x1080.mp4` | 1:1 — grid thumbnail, Instagram |
| `out/petch-cover-8s-1080x1920.mp4` | 9:16 — story / reel |

Each ships with a `-poster.png` first frame for use as a video poster or a
static fallback. All three are silent.

## The piece

A single continuous camera move along a horizontal track of four stations —
two seconds each, and the camera never stops, it only eases:

1. **Lockup** — mascot, `PETCH`, `YOUR AI HEALTHCARE CHATBOT`
2. **KNOW** — the chat composer, typing itself out
3. **LEARN** — the three Digital Omotenashi cards
4. **TAKE ACTION** — the health insight rows, on navy

The background travels cyan → navy → cyan, timed so the colour change happens
in the gap between stations where almost nothing is on screen.

Palette is sampled directly from the source film: cyan `#33CCFF`, component
fill `#00BAFF`, navy `#08233F`, insight row `#00487F`, badges `#FD5656` /
`#FDC557` / `#83F22D`, icon tiles `#E8788E` / `#3EA28A` / `#2E6AD5`.

## Why it loops cleanly

The camera travels exactly one track period, and **every element's state is a
pure function of the camera's track position**, not of wall-clock time — entrances,
exits, the typewriter, the colour blend. When the camera wraps, each slot
inherits its neighbour's exact state.

The camera itself is `x(u) = TRACK · (u − (k/2πN)·sin(2πN·u))`. The cosine in
its derivative averages to zero over the clip, so it lands on exactly one
TRACK; with `k = 0.82 < 1` the velocity dips to 18% at each station but never
reaches zero, which is what keeps the motion continuous instead of cutting.

Verified for all three formats: the frame at `t = 0` and the frame at `t = 8`
render byte-identical, so the clip can be cut at 8.000s and looped with no
visible seam.

## Why it's smooth

Frames are not captured in real time. `cover.html` exposes
`window.setT(seconds)`; `render.mjs` sets an exact timestamp, screenshots, and
pipes the PNG straight into ffmpeg. No dropped frames, no timing jitter.

## Regenerating

Needs `ffmpeg` (with libx264), a Chromium build, and `playwright-core`.

```bash
# mascot frames — decoded from the app's own idle GIF so the mascot can be
# advanced deterministically, one PNG per frame
mkdir -p cover-video/pet
ffmpeg -i health-app/src/assets/animation/character-idle.gif \
       -vf scale=550:693:flags=lanczos cover-video/pet/f%03d.png

# fonts
mkdir -p cover-video/fonts && cp health-app/public/fonts/*.otf cover-video/fonts/

# render
cd cover-video && python3 -m http.server 4318 --bind 127.0.0.1 &
node render.mjs 1920 1080 out/petch-cover-8s-1920x1080.mp4
node render.mjs 1080 1080 out/petch-cover-8s-1080x1080.mp4
node render.mjs 1080 1920 out/petch-cover-8s-1080x1920.mp4
```

`pet/` and `fonts/` are derived from assets already in the repo and are not
committed.

## Editing

Everything lives in `cover.html`:

- **`BUILDERS`** — one function per station. Adding a fifth station changes
  `NSTAT`; the loop stays exact because the travel distance is derived from it.
  At 8s, each station you add takes time away from the others.
- **`CARDS` / `ROWS` / `TYPED_TEXT`** — the copy inside the components.
- **`head(word, sub)`** — the kinetic headline and its caption.
- **`EASE_K`** — how hard the camera brakes at each station. 0 is a constant
  crawl; approaching 1 makes it nearly stop. Must stay below 1.
- **`S`** — per-format scale. The narrow formats are sized off width, since
  that is what constrains the content.
- **`setT(t)`** — the timeline. Anything added here must close over the loop:
  derive it from camera position, or from `sin`/`cos` of `TAU · u`.

## Embedding

```html
<video src="petch-cover-8s-1920x1080.mp4"
       poster="petch-cover-8s-1920x1080-poster.png"
       autoplay muted loop playsinline></video>
```

`muted` and `playsinline` are what let it autoplay on mobile Safari.
