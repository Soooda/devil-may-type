# Changelog

All notable changes to this extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-11-06

### Fixed

- Deletions now cost style points instead of awarding them, so holding
  backspace can no longer build rank.
- Pastes award a flat 20 points and no longer display a fake combo multiplier.
- Document events are scored as one aggregated net change. Undo, redo, and
  equal-length replacements no longer award points, and IME or multi-range
  updates no longer inflate the score.

### Changed

- The status bar skips re-rendering when the meter state has not changed.
- The extension development host disables the bundled Copilot extension to
  avoid task API rate-limit noise while debugging.

### Added

- Unit tests for the style meter, combo tracker, and rank table, a `typecheck`
  script, and a GitHub Actions CI workflow.

## [0.1.2] - 2026-07-27

### Changed

- Bumped `@vscode/vsce` to 3.9.2.

### Fixed

- Excluded `AGENTS.md` from the packaged VSIX.

## [0.1.1] - 2026-07-27

### Added

- Rank-up flash on the status bar, replacing the animation panel.
- Combo multiplier now stays in sync with the decay loop.

### Changed

- Tuned style meter constants for a DMC5 feel.

## [0.1.0] - 2026-04-09

Initial release: style ranks from D to SSS, combo multipliers, a live status
bar, rank-up flash, and rank-scaled decay.
