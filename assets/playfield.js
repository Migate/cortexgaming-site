// A small Breakout game on the home page.
// Until someone clicks it plays itself. Click, tap or press Space to play: move the paddle with the
// mouse, a finger drag or the left and right arrow keys. Three lives. Reduced motion: no self-play.
(function () {
  var c = document.getElementById('play');
  if (!c) return;
  var ctx = c.getContext('2d');
  var COLORS = ['#ff5a5f', '#ffb020', '#2ee6a6', '#4cc9f0', '#8b7cff'];
  var ROWS = 5, GAP = 6, BH = 20, TOP = 26, PAD_H = 10, PAD_Y = 46, R = 7, BASE = 230, MAX = 380;
  var W, H, cols, bw, bricks, pad, ball, last = 0, speed = BASE;
  var score = 0, hi = 0, lives = 3;
  var mode = 'attract'; // attract | serve | play | over
  var keys = { left: false, right: false };
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

  function serve() {
    ball = { x: pad.x, y: H - PAD_Y - R, vx: 0, vy: 0 };
  }

  function launch() {
    var side = Math.random() < 0.5 ? -1 : 1;
    ball.vx = side * speed * 0.55;
    ball.vy = -speed;
    mode = 'play';
  }

  function attractBall() {
    ball = { x: W * 0.4, y: H - PAD_Y - 40, vx: BASE * 0.8, vy: -BASE };
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
    speed = BASE; lives = 3; score = 0;
    mode = 'attract';
    attractBall();
    if (still) {
      for (var k = 0; k < 40 && k < bricks.length; k++) bricks[(k * 7) % bricks.length].alive = false;
      ball.y = H * 0.62; ball.x = W * 0.58;
    }
  }

  function startGame() {
    score = 0; lives = 3; speed = BASE;
    newBricks();
    pad.x = W / 2;
    mode = 'serve';
    serve();
  }

  function loseLife() {
    lives--;
    if (lives <= 0) { mode = 'over'; return; }
    mode = 'serve';
    serve();
  }

  function step(dt) {
    var py = H - PAD_Y, i;
    var human = mode === 'play' || mode === 'serve';

    if (human) {
      var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      pad.x += dir * 560 * dt;
    } else if (mode === 'attract') {
      pad.x += (ball.x - pad.x) * Math.min(1, dt * 6);
    }
    pad.x = Math.max(pad.w / 2, Math.min(W - pad.w / 2, pad.x));

    if (mode === 'serve') { ball.x = pad.x; ball.y = py - R; return; }
    if (mode === 'over') return;

    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
    if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < R) { ball.y = R; ball.vy = Math.abs(ball.vy); }

    if (ball.vy > 0 && ball.y + R >= py && ball.y < py + PAD_H && Math.abs(ball.x - pad.x) < pad.w / 2 + R) {
      var s = Math.hypot(ball.vx, ball.vy);
      ball.vx = s * 0.9 * ((ball.x - pad.x) / (pad.w / 2));
      ball.vy = -Math.sqrt(Math.max(s * s - ball.vx * ball.vx, (s * 0.4) * (s * 0.4)));
      ball.y = py - R;
    }
    if (ball.y > H + R) {
      if (mode === 'attract') { attractBall(); return; }
      loseLife(); return;
    }

    var alive = 0;
    for (i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      alive++;
      if (ball.x + R > b.x && ball.x - R < b.x + bw && ball.y + R > b.y && ball.y - R < b.y + BH) {
        b.alive = false; alive--; ball.vy = -ball.vy;
        if (mode === 'play') { score += 10; if (score > hi) hi = score; }
        break;
      }
    }
    if (!alive) {
      newBricks();
      if (mode === 'attract') { attractBall(); return; }
      speed = Math.min(MAX, speed * 1.08);
      mode = 'serve'; serve();
    }
  }

  function text(str, x, y, size, color, align) {
    ctx.font = size + 'px Silkscreen, monospace';
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, x, y);
  }

  function pad6(n) { return String(n).padStart(6, '0'); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    bricks.forEach(function (b) { if (b.alive) box(b.x, b.y, bw, BH, 5, COLORS[b.row]); });
    box(pad.x - pad.w / 2, H - PAD_Y, pad.w, PAD_H, 5, '#f2f4ff');
    if (mode !== 'over') {
      ctx.fillStyle = '#f2f4ff';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill();
    }
    text('SCORE ' + pad6(score), 16, H - 14, 13, '#9ba4c9', 'left');
    text('HI ' + pad6(hi) + '   LIVES ' + lives, W - 16, H - 14, 13, '#9ba4c9', 'right');

    var big = Math.max(16, Math.min(28, W / 22)), mid = H * 0.58;
    if (mode === 'attract') {
      text('CLICK OR TAP TO PLAY', W / 2, mid, big, '#f2f4ff', 'center');
      text('MOUSE, FINGER OR ARROW KEYS', W / 2, mid + big * 1.5, 13, '#9ba4c9', 'center');
    } else if (mode === 'serve') {
      text('CLICK, TAP OR SPACE TO LAUNCH', W / 2, mid, big * 0.8, '#f2f4ff', 'center');
    } else if (mode === 'over') {
      text('GAME OVER', W / 2, mid, big * 1.3, '#ff5a5f', 'center');
      text('CLICK OR TAP TO PLAY AGAIN', W / 2, mid + big * 1.7, 13, '#f2f4ff', 'center');
    }
  }

  function frame(t) {
    var dt = Math.min(0.04, (t - last) / 1000);
    last = t;
    step(dt); draw();
    requestAnimationFrame(frame);
  }

  var running = false;
  function ensureRunning() {
    if (running) return;
    running = true;
    requestAnimationFrame(function (t) { last = t; frame(t); });
  }

  function press() {
    if (mode === 'attract' || mode === 'over') startGame();
    else if (mode === 'serve') launch();
    draw();
    ensureRunning();
  }

  function moveTo(e) {
    if (mode === 'serve' || mode === 'play') {
      var r = c.getBoundingClientRect();
      pad.x = (e.clientX - r.left) * (W / r.width);
    }
  }

  c.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') c.setPointerCapture(e.pointerId);
    moveTo(e); press();
  });
  c.addEventListener('pointermove', moveTo);
  c.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); if (mode === 'attract' || mode === 'over') press(); }
    else if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); if (mode === 'attract' || mode === 'over') press(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); }
  });
  c.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });
  c.addEventListener('blur', function () { keys.left = keys.right = false; });

  if (document.fonts && document.fonts.load) document.fonts.load('13px Silkscreen');
  layout(); draw();
  window.addEventListener('resize', function () { if (c.clientWidth !== W) { layout(); draw(); } });
  if (!still) ensureRunning();
})();
