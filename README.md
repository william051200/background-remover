# Background Remover

A simple, private, browser-based app to remove the background from an image.
All processing happens **locally in your browser** — no uploads, no server, no
account, no quota.

## How it works

Two removal modes:

- **📷 Photo (AI)** — uses
  [`@imgly/background-removal`](https://github.com/imgly/background-removal-js)
  (AGPL-3.0), an ONNX segmentation model running in-browser via WebAssembly.
  Best for photos of people, products, or objects. The model (~tens of MB) is
  downloaded once and cached.
- **🎨 Logo / solid color** — a fast, deterministic canvas color-key that auto-detects
  the background color (from the image corners) and makes matching pixels transparent,
  with a soft anti-aliased edge and an adjustable **tolerance** slider. Best for logos,
  icons, text, or screenshots on a uniform background. No model, instant.

> Tip: for a logo on a solid background, the **Logo / solid color** mode gives
> pixel-perfect edges — the AI mode is designed for photographic subjects, not graphics.

## Features

- Drag-and-drop or click to upload (PNG, JPEG, WebP, BMP, up to 25 MB)
- Two modes: AI segmentation and solid-color key (with live tolerance slider)
- Before/after preview on a transparency checkerboard
- Download the result as a transparent PNG
- Reset to process another image

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Notes

- Output is always PNG to preserve transparency (JPEG has no alpha channel).
- The first run is slower because the model is downloaded; later runs use the cache.
- License: `@imgly/background-removal` is AGPL-3.0. Fine for personal/hobby use;
  a commercial license from img.ly is required for closed-source commercial products.
