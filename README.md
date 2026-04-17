# Devil May **TYPE**

A VS Code extension that brings **Devil May Cry** — style combo rating and visual feedback to your coding sessions. Type fast, build combos, and chase that SSS rank.

![Banner](assets/main.gif)

## Features

- **Style Rank** — earn ranks from D through SSS based on your typing speed and consistency
- **Combo Multiplier** — chain keystrokes within the combo window to multiply your points (up to 3x)
- **Live Status Bar** — color-coded rank, progress bar, and combo multiplier displayed at a glance
- **Rank-Up Animations** — dramatic animated webview panel slides in when you hit a new rank
- **Decay Mechanic** — points decay during inactivity, keeping you on your toes

### Rank Thresholds

| Rank | Points Required |
|------|----------------|
| D    | 0              |
| C    | 100            |
| B    | 250            |
| A    | 500            |
| S    | 800            |
| SS   | 1,200          |
| SSS  | 1,800          |

## Getting Started

### Prerequisites

- VS Code 1.80.0+
- Node.js (for development)

### Install from VSIX

1. Build the package: `npm run package`
2. In VS Code: `Extensions` → `...` → `Install from VSIX...` → select the generated `.vsix` file

### Development Setup

```bash
# Install dependencies
npm install

# Start watch mode (auto-recompiles on file changes)
npm run watch
```

Then press `F5` in VS Code to launch the Extension Development Host.

## Build Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Build with source maps (development) |
| `npm run watch` | Watch mode — rebuild on file changes |
| `npm run vscode:prepublish` | Minified production build |
| `npm run package` | Package as `.vsix` for distribution |

## Commands

| Command | Description |
|---------|-------------|
| `DMC Style Meter: Reset` | Reset rank to D and points to 0 |
| `DMC Style Meter: Show Panel` | Open the rank animation panel |

The status bar item is also clickable to open the animation panel.

## Configuration

All settings are under `dmcStyleMeter` in VS Code preferences.

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| `decayRate` | `0.015` | 0.001–0.1 | How fast points decay during inactivity (higher = faster) |
| `comboWindow` | `200` | 50–1000 ms | Max gap between keystrokes to count as a combo |
| `pasteThreshold` | `50` | 1+ chars | Pastes above this size are treated as a flat-point event |
| `gracePeriod` | `1500` | 0+ ms | Inactivity time before decay begins |

## Project Structure

```
src/
├── extension.ts          # Activation entry point
├── types.ts              # Type definitions and rank table
├── StyleMeter.ts         # Point tracking, decay, and rank calculation
├── ComboTracker.ts       # Combo window and multiplier logic
├── InputTracker.ts       # Document change listener
├── StatusBarController.ts# Status bar rendering
└── AnimationPanel.ts     # Webview panel for rank-up animations
media/
├── panel.html            # Animation panel markup
├── panel.js              # Panel client-side logic
└── panel.css             # Animations and rank-specific styling
```

## Tech Stack

- **TypeScript** — type-safe extension development
- **esbuild** — fast bundler, outputs a single `out/extension.js`
- **VS Code Webview API** — for the rank-up animation panel
- **@vscode/vsce** — packaging and publishing

## Future Work

- **Session high score** — track peak rank and max points reached this session, displayed on reset or window close
- **Rank history sparkline** — tiny ASCII graph in the status bar tooltip showing your rank trend over the last few minutes
- **Taunt on idle** — show a Dante quip in the status bar when you've been stuck at D rank too long ("Not good enough!")
- **Sound effects** — optional audio cue on rank-up via a small bundled clip played through the webview
- **Per-language stats** — track which file types you code most stylishly in
