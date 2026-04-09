export class ComboTracker {
  private comboCount = 0;
  private lastTime = 0;
  private comboWindow: number;

  constructor(comboWindow = 200) {
    this.comboWindow = comboWindow;
  }

  updateConfig(comboWindow: number): void {
    this.comboWindow = comboWindow;
  }

  record(): { comboCount: number; multiplier: number } {
    const now = Date.now();
    if (now - this.lastTime < this.comboWindow) {
      this.comboCount++;
    } else {
      this.comboCount = 0;
    }
    this.lastTime = now;
    return { comboCount: this.comboCount, multiplier: this.multiplierFor(this.comboCount) };
  }

  reset(): void {
    this.comboCount = 0;
    this.lastTime = 0;
  }

  private multiplierFor(count: number): number {
    if (count >= 30) return 3.0;
    if (count >= 15) return 2.0;
    if (count >= 5)  return 1.5;
    return 1.0;
  }
}
