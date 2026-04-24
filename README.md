# Devil May **TYPE**

<div align="center">

![Banner](assets/main.gif)

</div>

<div align="center">

A VS Code extension that brings **Devil May Cry** — style combo rating and visual feedback to your coding sessions. Type fast, build combos, and chase that SSS rank.

</div>

## Features

- **Style Rank** — earn ranks from D through SSS based on your typing speed and consistency
- **Combo Multiplier** — chain keystrokes within the combo window to multiply your points (up to 3x)
- **Live Status Bar** — color-coded rank, progress bar, and combo multiplier displayed at a glance
- **Rank-Up Animations** — dramatic animated webview panel slides in when you hit a new rank
- **Decay Mechanic** — points decay during inactivity, keeping you on your toes

## Installation

Search for **Devil May Type** in the VS Code Extensions marketplace, or install from the [VSIX](https://github.com/Soooda/devil-may-type/releases).

Requires VS Code 1.80.0+.

## Commands

| Command | Description |
|---------|-------------|
| `Devil May Type: Reset Rank` | Reset rank to D and points to 0 |
| `Devil May Type: Show Animation Panel` | Open the rank animation panel |

The status bar item is also clickable to open the animation panel.

## Configuration

All settings are under `dmt` in VS Code preferences.

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| `decayRate` | `0.015` | 0.001–0.1 | How fast points decay during inactivity (higher = faster) |
| `comboWindow` | `200` | 50–1000 ms | Max gap between keystrokes to count as a combo |
| `pasteThreshold` | `50` | 1+ chars | Pastes above this size are treated as a flat-point event |
| `gracePeriod` | `1500` | 0+ ms | Inactivity time before decay begins |

## Future Work

- **Session high score** — track peak rank and max points reached this session, displayed on reset or window close
- **Rank history sparkline** — tiny ASCII graph in the status bar tooltip showing your rank trend over the last few minutes
- **Taunt on idle** — show a Dante quip in the status bar when you've been stuck at D rank too long ("Not good enough!")
- **Sound effects** — optional audio cue on rank-up via a small bundled clip played through the webview
- **Per-language stats** — track which file types you code most stylishly in

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture, dev setup, and build instructions.

## License

[Apache-2.0 license](https://github.com/Soooda/devil-may-type/blob/main/LICENSE)
