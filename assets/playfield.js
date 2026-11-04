// An arcade field that plays itself: a ball breaks coloured bricks and the paddle never misses.
// It draws one still frame when the visitor prefers reduced motion.
(function () {
  var c = document.getElementById('play');
  if (!c) return;
  var ctx = c.getContext('2d');
  var COLORS = ['#ff5a5f', '#ffb020', '#2ee6a6', '#4cc9f0', '#8b7cff'];
  var ROWS = 5, GAP = 6, BH = 20, TOP = 26, PAD_H = 10, PAD_Y = 30, R = 7, SPEED = 230;
  var W, H, cols, bw, bricks, pad, ball, last = 0;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function box(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  function newBricks() {
    bricks = [];
    for (var r = 0; r < ROWS; r++) for (var i = 0; i < cols; i++) {
      bricks.push({ x: GAP + i * (bw + GAP), y: TOP + r * (BH + GAP), row: r, alive: true });
    }
  }

  function layout() {
    var dpr = window.devicePixelRatio || 1;
    W = c.clientWidth; H = c.clientHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(6, Math.floor(W / 70));
    bw = (W - GAP * (cols + 1)) / cols;
    newBricks();
    pad = { w: Math.min(130, W * 0.26), x: W / 2 };
    ball = { x: W * 0.4, y: H - PAD_Y - 40, vx: SPEED * 0.8, vy: -SPEED };
    if (still) { for (var k = 0; k < 40 && k < bricks.length; k++) bricks[(k * 7) % bricks.length].alive = false; ball.y = H * 0.62; ball.x = W * 0.58; }
  }

  function step(dt) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
    if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < R) { ball.y = R; ball.vy = Math.abs(ball.vy); }
    pad.x += (ball.x - pad.x) * Math.min(1, dt * 6);
    var py = H - PAD_Y;
    if (ball.vy > 0 && ball.y + R >= py && ball.y < py + PAD_H && Math.abs(ball.x - pad.x) < pad.w / 2 + R) {
      ball.vy = -Math.abs(ball.vy);
      ball.vx = SPEED * 1.1 * ((ball.x - pad.x) / (pad.w / 2));
      ball.y = py - R;
    }
    if (ball.y > H + R) { ball.y = py - 40; ball.vy = -SPEED; }
    var alive = 0;
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      alive++;
      if (ball.x + R > b.x && ball.x - R < b.x + bw && ball.y + R > b.y && ball.y - R < b.y + BH) {
        b.alive = false; alive--; ball.vy = -ball.vy; break;
      }
    }
    if (!alive) newBricks();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    bricks.forEach(function (b) { if (b.alive) box(b.x, b.y, bw, BH, 5, COLORS[b.row]); });
    box(pad.x - pad.w / 2, H - PAD_Y, pad.w, PAD_H, 5, '#f2f4ff');
    ctx.fillStyle = '#f2f4ff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill();
  }

  function frame(t) {
    var dt = Math.min(0.04, (t - last) / 1000);
    last = t;
    step(dt); draw();
    requestAnimationFrame(frame);
  }

  layout(); draw();
  window.addEventListener('resize', function () { layout(); draw(); });
  if (!still) requestAnimationFrame(function (t) { last = t; frame(t); });
})();
