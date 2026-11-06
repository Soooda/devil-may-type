import {
  MAX_POINTS,
  MeterState,
  Rank,
  RANK_TABLE,
  RankChangeResult,
  rankFromPoints,
} from './types';

const MAX_GAIN = 50;
const DELETION_PENALTY_PER_CHAR = 2;
const MAX_DELETION_PENALTY = 50;
const PASTE_POINTS = 20;

export class StyleMeter {
  private points = 0;
  private lastKeypressTime = 0;
  private _comboCount = 0;
  private _multiplier = 1.0;
  private _rank: Rank = 'D';

  private gracePeriod: number;
  private decayRate: number;

  constructor(gracePeriod = 1000, decayRate = 0.004) {
    this.gracePeriod = gracePeriod;
    this.decayRate = decayRate;
  }

  updateConfig(gracePeriod: number, decayRate: number): void {
    this.gracePeriod = gracePeriod;
    this.decayRate = decayRate;
  }

  onKeypress(charCount: number, isDeletion: boolean, multiplier: number): RankChangeResult {
    this._multiplier = multiplier;

    // Deletions cost style. Backspacing must never build rank, and bulk
    // deletes cost more than a single backspace, up to a fixed cap.
    const delta = isDeletion
      ? -Math.min(MAX_DELETION_PENALTY, DELETION_PENALTY_PER_CHAR * charCount)
      : Math.min(MAX_GAIN, 10 * multiplier * charCount);

    return this.applyDelta(delta);
  }

  /**
   * Pasted text is a flat award: it does not advance the combo and does not
   * inherit the multiplier.
   */
  onPaste(multiplier: number): RankChangeResult {
    this._multiplier = multiplier;
    return this.applyDelta(PASTE_POINTS);
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
    // DMC-authentic rank-scaled decay: S/SS/SSS decay 1.3× faster than lower
    // ranks, making high ranks genuinely harder to hold.
    const rankMult = this.rankIndex(this._rank) >= 4 ? 1.3 : 1.0;
    const decay = Math.max(1, this.points * this.decayRate * rankMult);
    this.points = Math.max(0, this.points - decay);

    this._rank = rankFromPoints(this.points).rank;
    return this.rankChangeResult(prevRank);
  }

  private applyDelta(delta: number): RankChangeResult {
    const prevRank = this._rank;

    this.points = Math.min(MAX_POINTS, Math.max(0, this.points + delta));
    this.lastKeypressTime = Date.now();
    this._rank = rankFromPoints(this.points).rank;

    return this.rankChangeResult(prevRank);
  }

  private rankChangeResult(prevRank: Rank): RankChangeResult {
    const state = this.getState();

    if (this._rank !== prevRank) {
      return {
        changed: true,
        direction: this.rankIndex(this._rank) > this.rankIndex(prevRank) ? 'up' : 'down',
        newRank: this._rank,
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
    return RANK_TABLE.findIndex((entry) => entry.rank === rank);
  }
}
