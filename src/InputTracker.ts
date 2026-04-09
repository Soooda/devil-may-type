import * as vscode from 'vscode';
import { ComboTracker } from './ComboTracker';
import { StyleMeter } from './StyleMeter';
import { RankChangeResult } from './types';

type OnChangeCallback = (result: RankChangeResult) => void;

export class InputTracker {
  private meter: StyleMeter;
  private combo: ComboTracker;
  private onChange: OnChangeCallback;
  private pasteThreshold: number;

  constructor(
    meter: StyleMeter,
    combo: ComboTracker,
    onChange: OnChangeCallback,
    pasteThreshold = 50
  ) {
    this.meter = meter;
    this.combo = combo;
    this.onChange = onChange;
    this.pasteThreshold = pasteThreshold;
  }

  updateConfig(pasteThreshold: number): void {
    this.pasteThreshold = pasteThreshold;
  }

  register(): vscode.Disposable {
    return vscode.workspace.onDidChangeTextDocument((event) => {
      // Only track changes in the active editor
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document !== event.document) {
        return;
      }

      for (const change of event.contentChanges) {
        const insertedLength = change.text.length;
        const deletedLength = change.rangeLength;

        if (insertedLength === 0 && deletedLength > 0) {
          // Pure deletion (backspace/delete)
          const comboResult = this.combo.record();
          this.meter.setCombo(comboResult.comboCount, comboResult.multiplier);
          const result = this.meter.onKeypress(1, true, 1.0);
          this.onChange(result);
        } else if (insertedLength > 0) {
          if (insertedLength > this.pasteThreshold) {
            // Treat as paste — flat award, no combo
            const result = this.meter.onKeypress(1, false, 2.0);
            this.onChange(result);
          } else {
            // Normal typing — each inserted char counts
            const comboResult = this.combo.record();
            this.meter.setCombo(comboResult.comboCount, comboResult.multiplier);
            const result = this.meter.onKeypress(insertedLength, false, comboResult.multiplier);
            this.onChange(result);
          }
        }
      }
    });
  }
}
