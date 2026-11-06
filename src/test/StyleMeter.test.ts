import { test } from 'node:test';
import assert from 'node:assert/strict';

import { StyleMeter } from '../StyleMeter';
import { MAX_POINTS } from '../types';

function buildPoints(meter: StyleMeter, total: number): void {
  // Each call inserts 10 characters at multiplier 1, awarding 50 points
  // (capped from 100) until the requested total is reached.
  for (let points = 0; points < total; points += 50) {
    meter.onKeypress(10, false, 1);
  }
}

test('inserts award 10 * multiplier * charCount capped at 50', () => {
  const oneChar = new StyleMeter();
  oneChar.onKeypress(1, false, 1);
  assert.equal(oneChar.getState().points, 10);

  const twentyChars = new StyleMeter();
  twentyChars.onKeypress(20, false, 1);
  assert.equal(twentyChars.getState().points, 50);

  const threeCharsDouble = new StyleMeter();
  threeCharsDouble.onKeypress(3, false, 2);
  assert.equal(threeCharsDouble.getState().points, 50);
});

test('deletions subtract min(50, 2 * charCount) without going negative', () => {
  const singleDelete = new StyleMeter();
  buildPoints(singleDelete, 100);
  singleDelete.onKeypress(1, true, 1);
  assert.equal(singleDelete.getState().points, 98);

  const cappedDelete = new StyleMeter();
  buildPoints(cappedDelete, 100);
  cappedDelete.onKeypress(100, true, 1);
  assert.equal(cappedDelete.getState().points, 50);

  const flooredDelete = new StyleMeter();
  flooredDelete.onKeypress(1, false, 1);
  assert.equal(flooredDelete.getState().points, 10);
  flooredDelete.onKeypress(100, true, 1);
  assert.equal(flooredDelete.getState().points, 0);
});

test('pastes award exactly 20 points regardless of multiplier', () => {
  const meter = new StyleMeter();
  meter.onPaste(3);
  assert.equal(meter.getState().points, 20);
});

test('rank up reports direction and new rank', () => {
  const meter = new StyleMeter();

  const first = meter.onKeypress(10, false, 1);
  assert.equal(first.changed, false);

  const second = meter.onKeypress(10, false, 1);
  assert.equal(second.changed, true);
  if (!second.changed) {
    assert.fail('expected a rank change');
  }
  assert.equal(second.direction, 'up');
  assert.equal(second.newRank, 'C');
  assert.equal(second.state.points, 100);
});

test('rank down reports direction and new rank', () => {
  const meter = new StyleMeter();
  buildPoints(meter, 100);

  const result = meter.onKeypress(100, true, 1);
  assert.equal(result.changed, true);
  if (!result.changed) {
    assert.fail('expected a rank change');
  }
  assert.equal(result.direction, 'down');
  assert.equal(result.newRank, 'D');
  assert.equal(result.state.points, 50);
});

test('points never exceed MAX_POINTS', () => {
  const meter = new StyleMeter();
  for (let i = 0; i < 100; i++) {
    meter.onKeypress(10, false, 1);
  }
  assert.equal(meter.getState().points, MAX_POINTS);
});

test('grace period blocks decay immediately after a keypress', () => {
  const meter = new StyleMeter(60000);
  meter.onKeypress(1, false, 1);
  const before = meter.getState().points;

  meter.tick();
  assert.equal(meter.getState().points, before);
});

test('decay removes points * decayRate at lower ranks', () => {
  const meter = new StyleMeter(0, 0.004);
  for (let i = 0; i < 10; i++) {
    meter.onKeypress(10, false, 1);
  }
  assert.equal(meter.getState().points, 500);

  meter.tick();
  assert.ok(Math.abs(meter.getState().points - 498) < 1e-9);
});

test('decay is 1.3x faster at S rank and above', () => {
  const meter = new StyleMeter(0, 0.004);
  for (let i = 0; i < 16; i++) {
    meter.onKeypress(10, false, 1);
  }
  assert.equal(meter.getState().points, 800);

  meter.tick();
  assert.ok(Math.abs(meter.getState().points - 795.84) < 1e-9);
});

test('reset restores points, rank, combo count, and multiplier', () => {
  const meter = new StyleMeter();
  buildPoints(meter, 250);
  meter.setCombo(7, 2.0);

  meter.reset();
  const state = meter.getState();
  assert.equal(state.points, 0);
  assert.equal(state.rank, 'D');
  assert.equal(state.comboCount, 0);
  assert.equal(state.multiplier, 1);
});
