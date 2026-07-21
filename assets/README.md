Place generated image assets here.

Expected files:
- TEXTURE_BG.webp   (1920x1080 — body background paper grain)
- DSA_ACCENT.webp   (120x120  — DSA tracker node graph illustration)

See design_assets.json at project root for full generation prompts.
After placing files, update index.html:
  1. TEXTURE_BG: uncomment the background-image line in :root and remove var(--img-texture-bg, none) fallback
  2. DSA_ACCENT: replace the inline SVG in .dsa-accent-placeholder with <img src="./assets/DSA_ACCENT.webp" width="80" height="80" alt="" aria-hidden="true">
