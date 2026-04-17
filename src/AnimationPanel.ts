import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Rank, RANK_TABLE, WebviewMessage } from './types';

export class AnimationPanel {
  private panel: vscode.WebviewPanel | undefined;
  private readonly extensionUri: vscode.Uri;
  private pendingMessages: WebviewMessage[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.extensionUri = context.extensionUri;
  }

  showRankUp(rank: Rank): void {
    const rankInfo = RANK_TABLE.find(r => r.rank === rank)!;
    const msg: WebviewMessage = {
      type: 'rankUp',
      rank,
      label: rankInfo.label,
      color: rankInfo.color,
    };

    if (!this.panel) {
      this.createPanel();
      // Queue message — webview JS may not be ready yet
      this.pendingMessages.push(msg);
    } else {
      this.panel.webview.postMessage(msg);
    }
  }

  show(): void {
    if (!this.panel) {
      this.createPanel();
    } else {
      this.panel.reveal(vscode.ViewColumn.Beside, true);
    }
  }

  dispose(): void {
    this.panel?.dispose();
    this.panel = undefined;
  }

  private createPanel(): void {
    this.panel = vscode.window.createWebviewPanel(
      'dmt',
      '🎮 Devil May Type',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
        retainContextWhenHidden: true,
      }
    );

    this.panel.webview.html = this.buildHtml(this.panel.webview);

    // Flush any queued messages once the webview signals it's ready
    this.panel.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'ready') {
        for (const pending of this.pendingMessages) {
          this.panel?.webview.postMessage(pending);
        }
        this.pendingMessages = [];
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private buildHtml(webview: vscode.Webview): string {
    const mediaPath = path.join(this.extensionUri.fsPath, 'media');
    const cssUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(mediaPath, 'panel.css'))
    );
    const jsUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(mediaPath, 'panel.js'))
    );

    const nonce = getNonce();
    const csp = webview.cspSource;

    const htmlTemplate = fs.readFileSync(path.join(mediaPath, 'panel.html'), 'utf8');
    return htmlTemplate
      .replace(/\$\{nonce\}/g, nonce)
      .replace(/\$\{cspSource\}/g, csp)
      .replace(/\$\{cssUri\}/g, cssUri.toString())
      .replace(/\$\{jsUri\}/g, jsUri.toString());
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
