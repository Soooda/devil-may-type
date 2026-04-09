# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run compile      # build (dev, with source maps) → out/extension.js
npm run watch        # watch mode, rebuilds on change
npm run package      # package as .vsix for distribution
npm run vscode:prepublish  # minified production build
```

There is no test suite. To run the extension manually, open the project in VS Code and press `F5` to launch the Extension Development Host.

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

**Key types** (all in `types.ts`):
- `MeterState` — snapshot passed to the status bar on every tick/keypress
- `RankChangeResult` — discriminated union; `changed: true` carries `direction` and `newRank`
- `RANK_TABLE` — single source of truth for rank thresholds, labels, and hex colors

**AnimationPanel** uses VS Code's Webview API. The panel HTML/JS/CSS live in `media/`. Messages flow one-way from the extension host to the webview via `panel.webview.postMessage({ type: 'rankUp', ... })`.

**Config changes** are handled live: `onDidChangeConfiguration` calls `updateConfig()` on `StyleMeter`, `ComboTracker`, and `InputTracker` without restarting — no reload required.

## Build

esbuild bundles `src/extension.ts` into a single CJS file at `out/extension.js`. The `vscode` module is marked external (provided by VS Code at runtime). Config is in `esbuild.mjs`.
