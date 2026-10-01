/* Easter egg: clicar várias vezes seguidas no nome da gráfica, no rodapé, solta confete nas cores de impressão. */
(function () {
  'use strict';
  var target = document.querySelector('.f-brand');
  if (!target) { return; }

  var NEEDED = 5;        // cliques seguidos
  var WINDOW = 1500;     // ms máximos entre um clique e o próximo
  var COLORS = ['#00A6D6', '#E5007D', '#FFD400', '#14141A', '#FF7A00', '#6B3FA0'];
  var count = 0, last = 0, busy = false;

  target.style.cursor = 'default';
  target.style.userSelect = 'none';

  target.addEventListener('click', function () {
    var now = Date.now();
    count = (now - last <= WINDOW) ? count + 1 : 1;
    last = now;
    if (count >= NEEDED && !busy) { count = 0; fire(); }
  });

  function fire() {
    busy = true;
    toast('Você achou o segredo! A Mega Impressos capricha até nos detalhes.');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setTimeout(function () { busy = false; }, 5000); return; }
    confetti(function () { busy = false; });
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);max-width:calc(100vw - 32px);' +
      'background:#14141A;color:#fff;padding:14px 22px;border-radius:999px;font:700 15px "DM Sans",sans-serif;' +
      'text-align:center;z-index:2147483000;opacity:0;transition:opacity .3s,transform .3s;border:2px solid #FFD400';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
    setTimeout(function () {
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 400);
    }, 4600);
  }

  function confetti(done) {
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147482999';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);

    var r = target.getBoundingClientRect();
    var ox = r.left + Math.min(r.width, 160) / 2, oy = r.top + r.height / 2;
    var ps = [];
    for (var i = 0; i < 160; i++) {
      var a = Math.random() * Math.PI - Math.PI;           // para cima
      var v = 6 + Math.random() * 11;
      ps.push({
        x: ox, y: oy, vx: Math.cos(a) * v * (0.6 + Math.random()), vy: Math.sin(a) * v,
        s: 5 + Math.random() * 7, rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[i % COLORS.length], dot: Math.random() < 0.4
      });
    }
    var start = performance.now(), DUR = 3600, over = false;
    function finish() { if (over) { return; } over = true; c.remove(); done(); }
    setTimeout(finish, DUR + 300);   // garante a limpeza mesmo se a aba ficar em segundo plano
    (function frame(t) {
      var k = t - start;
      ctx.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.vy += 0.32; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, (DUR - k) / 800));
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.dot) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.3); ctx.fill(); }
        else { ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); }
        ctx.restore();
      });
      if (k < DUR && !over) { requestAnimationFrame(frame); }
      else { finish(); }
    })(start);
  }
})();
