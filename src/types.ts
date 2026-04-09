export type Rank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface RankInfo {
  rank: Rank;
  label: string;
  color: string;
  threshold: number;
}

export interface MeterState {
  points: number;
  maxPoints: number;
  rank: Rank;
  comboCount: number;
  multiplier: number;
}

export type WebviewMessage =
  | { type: 'rankUp'; rank: Rank; label: string; color: string }
  | { type: 'stateUpdate'; state: MeterState };

export type RankChangeResult =
  | { changed: false; state: MeterState }
  | { changed: true; direction: 'up' | 'down'; newRank: Rank; state: MeterState };

export const RANK_TABLE: RankInfo[] = [
  { rank: 'D',   label: 'Daring',                 color: '#ff4444', threshold: 0    },
  { rank: 'C',   label: 'Crazy',                  color: '#ff8800', threshold: 100  },
  { rank: 'B',   label: 'Badass',                 color: '#ffcc00', threshold: 250  },
  { rank: 'A',   label: 'Awesome',                color: '#88ff00', threshold: 500  },
  { rank: 'S',   label: "Smokin'!",               color: '#00ffcc', threshold: 800  },
  { rank: 'SS',  label: 'Sick Skills!',           color: '#4488ff', threshold: 1200 },
  { rank: 'SSS', label: "Smokin' Sexy Style!!!", color: '#ffd700', threshold: 1800 },
];

export const MAX_POINTS = 2200;

export function rankFromPoints(points: number): RankInfo {
  for (let i = RANK_TABLE.length - 1; i >= 0; i--) {
    if (points >= RANK_TABLE[i].threshold) {
      return RANK_TABLE[i];
    }
  }
  return RANK_TABLE[0];
}
