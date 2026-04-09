(function () {
  'use strict';

  // eslint-disable-next-line no-undef
  const vscode = acquireVsCodeApi();

  const display  = document.getElementById('rank-display');
  const letterEl = document.getElementById('rank-letter');
  const nameEl   = document.getElementById('rank-name');

  let exitTimer   = null;
  let removeTimer = null;

  // Tell the extension host we're ready to receive messages
  vscode.postMessage({ type: 'ready' });

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (msg.type === 'rankUp') {
      showRankUp(msg.rank, msg.label, msg.color);
    }
  });

  function showRankUp(rank, label, color) {
    // Cancel any in-flight exit animation
    if (exitTimer)   { clearTimeout(exitTimer);   exitTimer   = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }

    // Update content
    letterEl.textContent = rank;
    nameEl.textContent   = label;
    letterEl.style.color = color;
    // Set CSS currentColor for the glow filter
    display.style.color  = color;

    // Restart animation by removing classes, forcing reflow, then re-adding
    display.classList.remove('hidden', 'exiting', 'entering');
    void display.offsetWidth; // force reflow
    display.classList.add('entering');

    // Entry: 0.45s + glow: 0.7s × 3 = 2.55s total, hold a bit
    // Then exit at 2.8s
    exitTimer = setTimeout(function () {
      display.classList.remove('entering');
      display.classList.add('exiting');

      // Hide after exit animation (0.5s)
      removeTimer = setTimeout(function () {
        display.classList.remove('exiting');
        display.classList.add('hidden');
      }, 520);
    }, 2800);
  }
}());
