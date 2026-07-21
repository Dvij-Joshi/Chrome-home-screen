# Chrome New Tab Dashboard

A personal developer dashboard built as a single `index.html` — designed for a final-year CS student grinding DSA and building projects. Editorial aesthetic, warm palette, zero frameworks.

## Features

- **Smart Search** — routes to Groq AI, Google, or direct URL based on intent
- **DSA Tracker** — editable streak, problem count, current topic, today's focus note
- **GitHub Heatmap** — live contributions grid via public API
- **LeetCode Heatmap** — live submissions calendar via GraphQL
- **Three Themes** — Daylight, Arctic, Obsidian — persisted in localStorage
- **Time-aware Greeting** — editorial Instrument Serif italic, changes by hour
- **Groq AI Integration** — `llama-3.3-70b-versatile` for DSA coaching and smart Q&A

## Tech Stack

- Vanilla HTML, CSS, JS — zero dependencies, zero frameworks
- Google Fonts: Instrument Serif · Inter · JetBrains Mono
- All data persisted in `localStorage`

## Setup

1. Open `index.html` in Chrome
2. Set as your New Tab page via a Chrome extension (e.g. "Custom New Tab URL")
3. On first load, enter your [Groq API key](https://console.groq.com) when prompted

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#F2EDE8` | Canvas background |
| `--color-surface` | `#EAE3DC` | Card backgrounds |
| `--color-ink` | `#1C1C1E` | Primary text |
| `--color-accent` | `#C95F3A` | Burnt sienna — primary CTA color |
| `--color-accent-sub` | `#4A7C7E` | Muted teal — secondary accent |

## Image Assets

See `design_assets.json` for pending image generation prompts. Two assets awaiting generation:

- `TEXTURE_BG` — subtle warm paper grain texture for body background
- `DSA_ACCENT` — minimal node-graph SVG illustration for DSA tracker card

Place generated assets in `./assets/` and update the CSS variable / inline SVG as noted in comments.

## Playlist

[Pratyush's 175-problem LeetCode Playlist](https://www.youtube.com/playlist?list=PLpIkg8OmuX-LZB9jYzbbZchk277H5CbdY)
