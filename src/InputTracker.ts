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

      // Undo/redo replays whole blocks of text, not typing.
      if (
        event.reason === vscode.TextDocumentChangeReason.Undo ||
        event.reason === vscode.TextDocumentChangeReason.Redo
      ) {
        return;
      }

      // Score the change as one user action. Aggregating also stops multi-range
      // and IME composition updates from being scored once per range.
      let insertedLength = 0;
      let deletedLength = 0;
      for (const change of event.contentChanges) {
        insertedLength += change.text.length;
        deletedLength += change.rangeLength;
      }

      const netLength = insertedLength - deletedLength;

      // Equal-length replacements (selection overwrite, IME update) are edits,
      // not new text.
      if (netLength === 0) {
        return;
      }

      // Paste: flat award, combo does not advance.
      if (netLength > this.pasteThreshold) {
        const comboState = this.combo.tick();
        this.meter.setCombo(comboState.comboCount, comboState.multiplier);
        this.onChange(this.meter.onPaste(comboState.multiplier));
        return;
      }

      // Deletion: costs points and never advances the combo.
      if (netLength < 0) {
        const comboState = this.combo.tick();
        this.meter.setCombo(comboState.comboCount, comboState.multiplier);
        this.onChange(this.meter.onKeypress(-netLength, true, comboState.multiplier));
        return;
      }

      // Normal typing: combo advances once per user action.
      const comboResult = this.combo.record();
      this.meter.setCombo(comboResult.comboCount, comboResult.multiplier);
      this.onChange(this.meter.onKeypress(netLength, false, comboResult.multiplier));
    });
  }
}
