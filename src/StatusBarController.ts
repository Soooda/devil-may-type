import * as vscode from 'vscode';
import { MeterState, Rank, RANK_TABLE, rankFromPoints } from './types';

const BAR_LENGTH = 15;
const FLASH_FILL_DURATION = 500;    // ms — eased bar fill 0 → current points
const FLASH_TOTAL_DURATION = 2000;  // ms — total flash visibility
const FLASH_RENDER_INTERVAL = 30;   // ms — refresh rate during the fill phase

function buildProgressBar(points: number, maxPoints: number): string {
  const filled = Math.round((points / maxPoints) * BAR_LENGTH);
  return '[' + '█'.repeat(filled) + '░'.repeat(BAR_LENGTH - filled) + ']';
}

// Ease-out cubic: fast start, gentle deceleration to the target.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class StatusBarController {
  private item: vscode.StatusBarItem;
  private currentState: MeterState = {
    points: 0,
    maxPoints: 2200,
    rank: 'D',
    comboCount: 0,
    multiplier: 1.0,
  };

  // Flash state — non-null timers are active and must be cleared on teardown.
  private isFlashing = false;
  private flashStartTime = 0;
  private flashRank: Rank = 'D';
  private flashFillTimer: ReturnType<typeof setInterval> | undefined;
  private flashEndTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1000
    );
    this.item.command = 'dmt.reset';
    this.item.tooltip = 'Devil May Type — click to reset rank';
    this.item.show();
    context.subscriptions.push(this.item);
    // Ensure any in-flight flash timers are stopped on deactivation.
    context.subscriptions.push({ dispose: () => this.clearFlashTimers() });

    // Show initial state
    this.update({
      points: 0,
      maxPoints: 2200,
      rank: 'D',
      comboCount: 0,
      multiplier: 1.0,
    });
  }

  update(state: MeterState): void {
    this.currentState = state;
    this.render();
  }

  /**
   * Trigger a dramatic rank-up flash on the status bar. Clears any in-flight
   * flash first so rapid rank-ups don't stack timers.
   */
  showRankUp(rank: Rank): void {
    this.clearFlashTimers();

    this.isFlashing = true;
    this.flashStartTime = Date.now();
    this.flashRank = rank;

    // High-frequency re-render so the bar fill animates smoothly.
    this.flashFillTimer = setInterval(() => {
      this.render();
    }, FLASH_RENDER_INTERVAL);

    // End the flash after the total duration: stop the fill loop and render
    // the normal frame once more.
    this.flashEndTimer = setTimeout(() => {
      this.isFlashing = false;
      this.clearFlashTimers();
      this.render();
    }, FLASH_TOTAL_DURATION);

    // Paint the first flash frame immediately.
    this.render();
  }

  reset(): void {
    this.clearFlashTimers();
    this.isFlashing = false;
    this.currentState = {
      points: 0,
      maxPoints: 2200,
      rank: 'D',
      comboCount: 0,
      multiplier: 1.0,
    };
    this.render();
  }

  /**
   * Branch on flash state. Extracted from the old inline `update()` so both
   * the decay loop and the flash timer drive a single render path.
   */
  private render(): void {
    if (this.isFlashing) {
      this.renderFlash();
    } else {
      this.renderNormal();
    }
  }

  private renderNormal(): void {
    const rankInfo = rankFromPoints(this.currentState.points);
    const bar = buildProgressBar(this.currentState.points, this.currentState.maxPoints);
    const combo =
      this.currentState.multiplier > 1.0
        ? ` ×${this.currentState.multiplier.toFixed(1)}`
        : '';

    this.item.text = `$(flame) ${rankInfo.rank}  ${rankInfo.label}  ${bar} ${Math.floor(
      this.currentState.points
    )}${combo}`;
    this.item.color = rankInfo.color;
  }

  private renderFlash(): void {
    const rankInfo = RANK_TABLE.find((r) => r.rank === this.flashRank)!;
    const elapsed = Date.now() - this.flashStartTime;

    // Eased fill fraction: 0 → 1 over FLASH_FILL_DURATION, then clamped at 1
    // so the bar holds full for the remainder of the flash.
    const linearT = Math.min(elapsed / FLASH_FILL_DURATION, 1);
    const easedT = easeOutCubic(linearT);

    // Fill the bar toward the current live point count (may shift slightly as
    // decay continues during the flash — keeps the moment alive).
    const targetFilled = Math.round(
      (this.currentState.points / this.currentState.maxPoints) * BAR_LENGTH
    );
    const filled = Math.round(easedT * targetFilled);
    const bar = '[' + '█'.repeat(filled) + '░'.repeat(BAR_LENGTH - filled) + ']';

    // Flash frame: flanking stars, full label, animated bar, NO points/combo.
    this.item.text = `$(star) ${this.flashRank}  ${rankInfo.label}  ${bar} $(star)`;
    this.item.color = rankInfo.color;
  }

  private clearFlashTimers(): void {
    if (this.flashFillTimer) {
      clearInterval(this.flashFillTimer);
      this.flashFillTimer = undefined;
    }
    if (this.flashEndTimer) {
      clearTimeout(this.flashEndTimer);
      this.flashEndTimer = undefined;
    }
  }
}
