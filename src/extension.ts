import * as vscode from 'vscode';
import { AnimationPanel } from './AnimationPanel';
import { ComboTracker } from './ComboTracker';
import { InputTracker } from './InputTracker';
import { StatusBarController } from './StatusBarController';
import { StyleMeter } from './StyleMeter';

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('dmt');

  const meter = new StyleMeter(
    config.get<number>('gracePeriod', 1500),
    config.get<number>('decayRate', 0.015)
  );
  const combo = new ComboTracker(config.get<number>('comboWindow', 200));
  const statusBar = new StatusBarController(context);
  const animPanel = new AnimationPanel(context);

  const tracker = new InputTracker(
    meter,
    combo,
    (result) => {
      statusBar.update(result.state);
      if (result.changed && result.direction === 'up') {
        animPanel.showRankUp(result.newRank);
      }
    },
    config.get<number>('pasteThreshold', 50)
  );

  context.subscriptions.push(tracker.register());

  // Decay interval — runs every 100ms
  const decayInterval = setInterval(() => {
    const result = meter.tick();
    statusBar.update(result.state);
    // No animation on rank-down
  }, 100);

  context.subscriptions.push({
    dispose: () => clearInterval(decayInterval),
  });

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('dmt.reset', () => {
      meter.reset();
      combo.reset();
      statusBar.reset();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('dmt.showPanel', () => {
      animPanel.show();
    })
  );

  // React to config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('dmt')) return;
      const c = vscode.workspace.getConfiguration('dmt');
      meter.updateConfig(
        c.get<number>('gracePeriod', 1500),
        c.get<number>('decayRate', 0.015)
      );
      combo.updateConfig(c.get<number>('comboWindow', 200));
      tracker.updateConfig(c.get<number>('pasteThreshold', 50));
    })
  );
}

export function deactivate(): void {
  // Disposables are cleaned up via context.subscriptions
}
