# Foldcraft — hero landing page

Single viewport-height hero for a creative studio: looping background video,
responsive navbar with an animated mobile menu, and staggered hero text.

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · lucide-react · Geist (Google Fonts)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Structure

| File | Contents |
| --- | --- |
| `index.html` | Geist `<link>` (weights 300–700), app mount point |
| `src/App.jsx` | Video background, navbar, mobile menu, hero content |
| `src/index.css` | Tailwind layers, CSS reset, font smoothing, `fadeSlideUp` keyframes |
| `tailwind.config.js` | `fontFamily.geist`, `opacity.98` |

## Layers

| Layer | z-index |
| --- | --- |
| Background video | none (behind everything) |
| Hero content | `z-10` |
| Mobile menu overlay | `z-20` |
| Navbar | `z-30` |
| Menu toggle button | `z-50` |

## Animation timing

Hero elements share one keyframe, `fadeSlideUp` (24px rise + fade, 0.8s), and are
staggered by delay: badge `0.2s`, heading `0.4s`, paragraph `0.7s`, CTA `0.9s`.
All use `both` fill so they hold their start state before the delay elapses.

The mobile menu animates its own height and opacity over `500ms` with
`cubic-bezier(0.16,1,0.3,1)`; the inner content follows `100ms` later with a
translate + fade, so the panel opens before its links arrive.

## One note on the config

`bg-black/98` does not compile in Tailwind v3 unless `98` exists on the opacity
scale — 98 is not one of its default steps, so the utility is silently dropped
and the mobile menu overlay ends up fully transparent. `tailwind.config.js`
therefore extends `opacity` with `98`, which keeps the class name as specified.

## Background video

The video is loaded from a remote URL in `src/App.jsx` (`VIDEO_SRC`). It is
`autoPlay muted loop playsInline` — `muted` is what allows autoplay in browsers,
so keep it if the video should start on its own.
