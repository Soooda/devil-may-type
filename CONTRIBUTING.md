# Contributing to Devil May Type

Thanks for your interest in contributing! This document covers the architecture, dev setup, and build process.

## Dev Setup

**Prerequisites:** VS Code 1.80.0+, Node.js

```bash
npm install       # install dependencies
npm run watch     # watch mode, rebuilds on change
```

Then press `F5` in VS Code to launch the Extension Development Host.

## Build Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Build with source maps (development) |
| `npm run watch` | Watch mode — rebuild on file changes |
| `npm run vscode:prepublish` | Minified production build |
| `npm run package` | Package as `.vsix` for distribution |

To install a local build: `Extensions` → `...` → `Install from VSIX...` → select the generated `.vsix`.

## Architecture

The extension activates on `onStartupFinished` and wires together five classes in `extension.ts`:

```
InputTracker  →  StyleMeter  →  StatusBarController
                     ↑               ↓
              ComboTracker      AnimationPanel
```

**Data flow for a keypress:**
1. `InputTracker` listens to `onDidChangeTextDocument` and classifies each change as deletion, normal insert, or paste.
2. It calls `ComboTracker.record()` to get the current combo count and multiplier.
3. It calls `StyleMeter.onKeypress(charCount, isDeletion, multiplier)` which awards points and returns a `RankChangeResult`.
4. The callback in `extension.ts` updates `StatusBarController` and, on rank-up, triggers `AnimationPanel`.

**Decay loop:** A `setInterval` at 100ms calls `StyleMeter.tick()`, which decays points after the grace period and updates the status bar. Rank-downs are silent (no animation).

**Config changes** are handled live: `onDidChangeConfiguration` calls `updateConfig()` on `StyleMeter`, `ComboTracker`, and `InputTracker` without restarting — no reload required.

## Key Types (`types.ts`)

- `MeterState` — snapshot passed to the status bar on every tick/keypress
- `RankChangeResult` — discriminated union; `changed: true` carries `direction` and `newRank`
- `RANK_TABLE` — single source of truth for rank thresholds, labels, and hex colors

## Project Structure

```
src/
├── extension.ts           # Activation entry point
├── types.ts               # Type definitions and rank table
├── StyleMeter.ts          # Point tracking, decay, and rank calculation
├── ComboTracker.ts        # Combo window and multiplier logic
├── InputTracker.ts        # Document change listener
├── StatusBarController.ts # Status bar rendering
└── AnimationPanel.ts      # Webview panel for rank-up animations
media/
├── panel.html             # Animation panel markup
├── panel.js               # Panel client-side logic
└── panel.css              # Animations and rank-specific styling
```

## Tech Stack

- **TypeScript** — type-safe extension development
- **esbuild** — fast bundler, outputs a single `out/extension.js`
- **VS Code Webview API** — for the rank-up animation panel
- **@vscode/vsce** — packaging and publishing

The esbuild config lives in `esbuild.mjs`. The `vscode` module is marked external (provided by VS Code at runtime).
