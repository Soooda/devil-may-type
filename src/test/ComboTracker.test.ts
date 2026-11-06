import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ComboTracker } from '../ComboTracker';

test('first record starts at zero and later records increment', () => {
  const tracker = new ComboTracker(60000);

  const first = tracker.record();
  assert.equal(first.comboCount, 0);
  assert.equal(first.multiplier, 1.0);

  assert.equal(tracker.record().comboCount, 1);
  assert.equal(tracker.record().comboCount, 2);
});

test('multiplier thresholds follow the returned combo count', () => {
  const tracker = new ComboTracker(60000);
  const byCount = new Map<number, number>();

  for (let i = 0; i < 30; i++) {
    const result = tracker.record();
    byCount.set(result.comboCount, result.multiplier);
  }

  for (const count of [1, 2, 3]) {
    assert.equal(byCount.get(count), 1.0);
  }
  for (const count of [4, 11]) {
    assert.equal(byCount.get(count), 1.5);
  }
  for (const count of [12, 24]) {
    assert.equal(byCount.get(count), 2.0);
  }
  for (const count of [25, 29]) {
    assert.equal(byCount.get(count), 3.0);
  }
});

test('reset restores combo count and multiplier', () => {
  const tracker = new ComboTracker(60000);
  for (let i = 0; i < 5; i++) {
    tracker.record();
  }

  tracker.reset();
  const state = tracker.tick();
  assert.equal(state.comboCount, 0);
  assert.equal(state.multiplier, 1.0);
});

test('tick expires a combo', () => {
  const tracker = new ComboTracker(0);
  tracker.record();
  tracker.record();

  const state = tracker.tick();
  assert.equal(state.comboCount, 0);
  assert.equal(state.multiplier, 1.0);
});
