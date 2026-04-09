import {
  MAX_POINTS,
  MeterState,
  Rank,
  RankChangeResult,
  rankFromPoints,
} from './types';

export class StyleMeter {
  private points = 0;
  private lastKeypressTime = 0;
  private _comboCount = 0;
  private _multiplier = 1.0;
  private _rank: Rank = 'D';

  private gracePeriod: number;
  private decayRate: number;

  constructor(gracePeriod = 1500, decayRate = 0.015) {
    this.gracePeriod = gracePeriod;
    this.decayRate = decayRate;
  }

  updateConfig(gracePeriod: number, decayRate: number): void {
    this.gracePeriod = gracePeriod;
    this.decayRate = decayRate;
  }

  onKeypress(charCount: number, isDeletion: boolean, multiplier: number): RankChangeResult {
    const prevRank = this._rank;
    this._multiplier = multiplier;

    let gain: number;
    if (isDeletion) {
      gain = 2;
    } else {
      gain = Math.min(50, 10 * multiplier * charCount);
    }

    this.points = Math.min(MAX_POINTS, this.points + gain);
    this.lastKeypressTime = Date.now();

    const newRankInfo = rankFromPoints(this.points);
    this._rank = newRankInfo.rank;

    const state = this.getState();

    if (newRankInfo.rank !== prevRank) {
      const prevIndex = this.rankIndex(prevRank);
      const newIndex = this.rankIndex(newRankInfo.rank);
      return {
        changed: true,
        direction: newIndex > prevIndex ? 'up' : 'down',
        newRank: newRankInfo.rank,
        state,
      };
    }

    return { changed: false, state };
  }

  tick(): RankChangeResult {
    const now = Date.now();
    if (now - this.lastKeypressTime < this.gracePeriod) {
      return { changed: false, state: this.getState() };
    }

    if (this.points === 0) {
      return { changed: false, state: this.getState() };
    }

    const prevRank = this._rank;
    const decay = Math.max(2, this.points * this.decayRate);
    this.points = Math.max(0, this.points - decay);

    const newRankInfo = rankFromPoints(this.points);
    this._rank = newRankInfo.rank;

    const state = this.getState();

    if (newRankInfo.rank !== prevRank) {
      const prevIndex = this.rankIndex(prevRank);
      const newIndex = this.rankIndex(newRankInfo.rank);
      return {
        changed: true,
        direction: newIndex > prevIndex ? 'up' : 'down',
        newRank: newRankInfo.rank,
        state,
      };
    }

    return { changed: false, state };
  }

  reset(): void {
    this.points = 0;
    this._rank = 'D';
    this._comboCount = 0;
    this._multiplier = 1.0;
    this.lastKeypressTime = 0;
  }

  setCombo(comboCount: number, multiplier: number): void {
    this._comboCount = comboCount;
    this._multiplier = multiplier;
  }

  getState(): MeterState {
    return {
      points: this.points,
      maxPoints: MAX_POINTS,
      rank: this._rank,
      comboCount: this._comboCount,
      multiplier: this._multiplier,
    };
  }

  private rankIndex(rank: Rank): number {
    const order: Rank[] = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    return order.indexOf(rank);
  }
}
