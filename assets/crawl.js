// A pixel snake crawls along the bottom of the hero. It stops when the visitor prefers reduced motion.
(function () {
  var c = document.getElementById('crawl');
  if (!c) return;
  var ctx = c.getContext('2d');
  var CELL = 8, ROWS = 9, LEN = 14, APPLE_EVERY = 31;
  var style = getComputedStyle(document.documentElement);
  var ink = style.getPropertyValue('--ink').trim();
  var grid = 'rgba(43,42,12,.13)';
  var cols = 0, head = 0, timer = null;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rowAt(x) { return Math.round(4 + 2.4 * Math.sin(x / 5.5)); }

  function size() {
    var w = c.clientWidth, dpr = window.devicePixelRatio || 1;
    cols = Math.floor(w / CELL);
    c.width = Math.round(w * dpr);
    c.height = Math.round(ROWS * CELL * dpr);
    ctx.setTransform(dpr * (w / (cols * CELL)), 0, 0, dpr, 0, 0);
  }

  function cell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  }

  function draw() {
    ctx.clearRect(0, 0, cols * CELL, ROWS * CELL);
    var x, y;
    for (x = 0; x < cols; x++) for (y = 0; y < ROWS; y++) cell(x, y, grid);
    for (x = APPLE_EVERY; x < cols; x += APPLE_EVERY) {
      if (x > head) cell(x, rowAt(x), ink);
    }
    for (var i = 0; i < LEN; i++) {
      x = head - i;
      if (x >= 0 && x < cols) cell(x, rowAt(x), ink);
    }
  }

  function tick() {
    head = (head + 1) % (cols + LEN);
    draw();
  }

  function start() { if (!timer && !still) timer = setInterval(tick, 110); }
  function stop() { clearInterval(timer); timer = null; }

  size();
  head = still ? Math.floor(cols * 0.6) : 0;
  draw();
  start();
  window.addEventListener('resize', function () { size(); head = Math.min(head, cols); draw(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
