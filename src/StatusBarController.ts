import * as vscode from 'vscode';
import { MeterState, RANK_TABLE, rankFromPoints } from './types';

const BAR_LENGTH = 15;

function buildProgressBar(points: number, maxPoints: number): string {
  const filled = Math.round((points / maxPoints) * BAR_LENGTH);
  return '[' + '█'.repeat(filled) + '░'.repeat(BAR_LENGTH - filled) + ']';
}

export class StatusBarController {
  private item: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1000
    );
    this.item.command = 'dmcStyleMeter.showPanel';
    this.item.tooltip = 'DMC Style Meter — click to show animation panel';
    this.item.show();
    context.subscriptions.push(this.item);

    // Show initial state
    this.update({ points: 0, maxPoints: 2200, rank: 'D', comboCount: 0, multiplier: 1.0 });
  }

  update(state: MeterState): void {
    const rankInfo = rankFromPoints(state.points);
    const bar = buildProgressBar(state.points, state.maxPoints);
    const combo = state.multiplier > 1.0 ? ` ×${state.multiplier.toFixed(1)}` : '';

    this.item.text = `$(flame) ${rankInfo.rank}  ${rankInfo.label}  ${bar} ${Math.floor(state.points)}${combo}`;
    this.item.color = rankInfo.color;
  }

  reset(): void {
    const rankInfo = RANK_TABLE[0];
    this.item.text = `$(flame) D  ${rankInfo.label}  ${'[' + '░'.repeat(BAR_LENGTH) + ']'} 0`;
    this.item.color = rankInfo.color;
  }
}
