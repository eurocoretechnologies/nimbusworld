# NIMBUSWORLD — Your Next Chapter

Cinematic single-page site for NIMBUSWORLD Education Consultancy, Pune.
Next.js (App Router) · React Three Fiber · GSAP ScrollTrigger + Lenis · Motion · zustand.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Before launch

| Item | Where |
| --- | --- |
| Official logo | `public/logo.png`, used exactly as supplied (on dark grounds it sits on an ivory plate; never recoloured). Rebuild after replacing it — the page is prerendered. |
| Office address, phone, email | `src/data/content.ts` → `contact` |
| Consultation delivery | Set `CONSULTATION_WEBHOOK_URL` (CRM, Apps Script, Zapier/Make, email relay). Without it, dev logs requests and production returns 503 rather than dropping them. |
| Course / VFS program names, destination details | `src/data/content.ts` — every unknown is an explicit placeholder. |

## How it fits together

- **One timeline.** `src/lib/timeline.ts` defines the scroll map as weighted segments (hero, open, pune, pullback, destinations, … finale). Disabled segments (phase 2) are skipped and the rest renormalised, so scene code only ever reads segment‑local 0→1 progress.
- **Scroll → store.** `useMasterTimeline` scrubs a single GSAP timeline (Lenis-smoothed) and writes progress to the zustand store. The 3D scene reads it transiently in `useFrame` (no re-renders); DOM overlays use `useScrub` / `useProgressValue`. Everything reverses with the scroll.
- **Scene** (`src/three`), one folder per chapter:
  - `book/` — the book, bendable page leaves (vertex-shader curl), closing/thinning into a passport and back.
  - `map/` — paper-relief world built in a Web Worker from Natural Earth coastlines; wraps into a globe in the vertex shader (`globeMorph.ts`).
  - `prologue/`, `destinations/` — Pune in miniature; pins, routes, camera dive.
  - `courses/` — five printed course pages dealt across the spread, each lifting in turn.
  - `languages/` + `lineart/` — ink glyphs that rise into line-drawn architecture on an ivory "paper world" (`Backdrop.tsx`).
  - `visa/` — passport pages: guilloche, live stage checklist, pressed stamp (no real-document imitation).
  - `professional/` — pop-ups: split-flap IATA board, PNQ luggage tag, application stack.
  - `journey/` — step pages, terminal vault, lift-off, globe, university and skyline.
  - `camera/shots.ts` — every composed camera shot, keyed by segment-local time.
  Textures and print are procedural (canvas) — nothing to download. Pure chapter state lives in `*State.ts` files with no three.js import, so the DOM overlays never pull the 3D engine into the first bundle.
- **Fallback.** No WebGL or `prefers-reduced-motion` → the editorial edition (`src/sections/editorial`), same copy, no canvas.

## Review helpers

- `?editorial` — force the static edition.
- `?debug` — live frame-rate meter.
- Dev console: `__nimbusGo(0.42)` jumps the film to a progress value.

## Not yet built

Chapter 01 "Discover" (objects rising from the page) is listed in the contents as "In preparation" — it was not part of the phase plan.

## Content rules baked in

No invented facts: placeholders read "Details coming soon". VFS Global is described only as a tie-up, with no logo. The map shows coastlines only — no political borders.
