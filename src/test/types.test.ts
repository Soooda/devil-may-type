import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_POINTS, RANK_TABLE, rankFromPoints } from '../types';

test('MAX_POINTS is 2200', () => {
  assert.equal(MAX_POINTS, 2200);
});

test('rankFromPoints resolves every threshold boundary', () => {
  const cases: Array<[number, string]> = [
    [0, 'D'],
    [99, 'D'],
    [100, 'C'],
    [249, 'C'],
    [250, 'B'],
    [499, 'B'],
    [500, 'A'],
    [799, 'A'],
    [800, 'S'],
    [1199, 'S'],
    [1200, 'SS'],
    [1799, 'SS'],
    [1800, 'SSS'],
    [2200, 'SSS'],
    [99999, 'SSS'],
  ];

  for (const [points, rank] of cases) {
    assert.equal(rankFromPoints(points).rank, rank, `points ${points}`);
  }
});

test('RANK_TABLE is ordered and fully populated', () => {
  for (let i = 1; i < RANK_TABLE.length; i++) {
    assert.ok(
      RANK_TABLE[i].threshold > RANK_TABLE[i - 1].threshold,
      `threshold order at index ${i}`
    );
  }

  for (const entry of RANK_TABLE) {
    assert.ok(entry.label.length > 0, `label for ${entry.rank}`);
    assert.ok(entry.color.length > 0, `color for ${entry.rank}`);
  }
});
