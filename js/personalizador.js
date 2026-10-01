/* Personalizador de produtos – tudo roda no navegador; a foto nunca sai do aparelho. */
(function () {
  'use strict';

  var WHATSAPP = '5581994192339';
  var W = 900;

  var PRESETS = [
    { n: 'Branco e magenta', c: ['#FFFFFF', '#14141A', '#E5007D'] },
    { n: 'Amarelo', c: ['#FFD400', '#14141A', '#E5007D'] },
    { n: 'Escuro', c: ['#14141A', '#FFFFFF', '#FFD400'] },
    { n: 'Azul', c: ['#0A2A4A', '#FFFFFF', '#00A6D6'] },
    { n: 'Magenta', c: ['#E5007D', '#FFFFFF', '#FFD400'] },
    { n: 'Verde', c: ['#0E7C3F', '#FFFFFF', '#FFD400'] }
  ];

  var SHAPES = { circulo: 'Círculo', arredondado: 'Cantos arredondados', quadrado: 'Quadrado / retângulo' };

  var PRODUCTS = {
    cartoes: {
      nome: 'Cartão de visita', mode: 'logo', bar: 'top', preset: 0,
      sizes: [{ l: '9 × 5 cm', a: 1.8 }],
      texts: [['Nome', 'Seu Nome'], ['Cargo ou empresa', 'Sua Empresa'], ['Telefone', '(81) 99999-9999'], ['Instagram ou e-mail', '@seuperfil']]
    },
    adesivos: {
      nome: 'Adesivo', mode: 'fundo', border: true, preset: 0,
      shapes: ['circulo', 'arredondado', 'quadrado'],
      sizes: [{ l: '5 × 5 cm', a: 1 }, { l: '7 × 7 cm', a: 1 }, { l: '10 × 10 cm', a: 1 }, { l: '10 × 5 cm', a: 2 }],
      texts: [['Texto (opcional)', '']]
    },
    rotulos: {
      nome: 'Rótulo', mode: 'logo', bar: 'bottom', preset: 1,
      shapes: ['arredondado', 'quadrado'],
      sizes: [{ l: '8 × 5 cm', a: 1.6 }, { l: '6 × 6 cm', a: 1 }, { l: '10 × 6 cm', a: 1.667 }],
      texts: [['Produto', 'Nome do produto'], ['Descrição', 'Descrição curta do produto'], ['Detalhe', 'Peso ou validade']]
    },
    panfletos: {
      nome: 'Panfleto', mode: 'faixa', preset: 0,
      sizes: [{ l: 'A6 (10,5 × 14,8 cm)', a: 0.707 }, { l: 'A5 (14,8 × 21 cm)', a: 0.707 }, { l: 'A4 (21 × 29,7 cm)', a: 0.707 }],
      texts: [['Título', 'Sua promoção aqui'], ['Texto', 'Descreva a sua oferta em poucas palavras.'], ['Contato', '(81) 99999-9999'], ['Endereço ou site', 'Igarassu – PE']]
    },
    banners: {
      nome: 'Banner', mode: 'faixa', preset: 3,
      sizes: [{ l: '60 × 90 cm', a: 0.667 }, { l: '80 × 120 cm', a: 0.667 }, { l: '90 × 120 cm', a: 0.75 }],
      texts: [['Título', 'Sua marca aqui'], ['Subtítulo', 'Mensagem principal do banner'], ['Contato', '(81) 99999-9999']]
    },
    etiquetas: {
      nome: 'Etiqueta', mode: 'logo', bar: 'bottom', preset: 4,
      shapes: ['arredondado', 'circulo', 'quadrado'],
      sizes: [{ l: '5 × 3 cm', a: 1.667 }, { l: '4 × 4 cm', a: 1 }, { l: '6 × 4 cm', a: 1.5 }],
      texts: [['Nome', 'Nome da marca'], ['Detalhe', 'Detalhe ou slogan']]
    },
    geral: {
      nome: 'Impressão personalizada', mode: 'fundo', preset: 2,
      sizes: [{ l: 'A5 horizontal', a: 1.414 }, { l: 'A5 vertical', a: 0.707 }, { l: 'Quadrado 20 × 20 cm', a: 1 }],
      texts: [['Título', 'Seu título'], ['Texto', 'Seu texto aqui']]
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var dlg = $('pz');
  if (!dlg || !dlg.showModal) { return; }
  var canvas = $('pz-canvas');
  var ctx = canvas.getContext('2d');

  var st = null;      // estado da personalização atual
  var box = null;     // área da foto na última renderização (para arrastar)

  /* ---------- abrir / fechar ---------- */
  function open(key) {
    var p = PRODUCTS[key];
    if (!p) { return; }
    var pr = PRESETS[p.preset];
    st = {
      key: key, p: p, img: null, mode: p.mode, fit: 'cover', zoom: 1, ox: 0, oy: 0,
      shape: p.shapes ? p.shapes[0] : 'quadrado',
      size: 0, texts: p.texts.map(function (t) { return t[1]; }),
      bg: pr.c[0], tx: pr.c[1], ac: pr.c[2]
    };
    if (key === 'cartoes') { st.shape = 'arredondado'; }
    $('pz-title').textContent = 'Personalizar ' + p.nome.toLowerCase();
    $('pz-file').value = '';
    buildControls();
    syncControls();
    document.body.style.overflow = 'hidden';
    dlg.showModal();
    var go = function () { render(true); };
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('800 40px "Bricolage Grotesque"'), document.fonts.load('500 20px "DM Sans"')]).then(go, go);
    }
    go();
  }
  function close() { if (dlg.open) { dlg.close(); } }
  dlg.addEventListener('close', function () { if (!dlg.open) { document.body.style.overflow = ''; st = null; } });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) { close(); } });
  $('pz-x').addEventListener('click', close);

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-produto]') : null;
    if (b) { open(b.getAttribute('data-produto')); }
  });

  /* ---------- controles ---------- */
  function fill(sel, items, val) {
    sel.innerHTML = '';
    items.forEach(function (it) {
      var o = document.createElement('option');
      o.value = it[0]; o.textContent = it[1];
      sel.appendChild(o);
    });
    sel.value = val;
  }

  function buildControls() {
    var p = st.p;
    fill($('pz-size'), p.sizes.map(function (s, i) { return [String(i), s.l]; }), '0');
    $('pz-size-row').hidden = p.sizes.length < 2;
    if (p.shapes) {
      fill($('pz-shape'), p.shapes.map(function (k) { return [k, SHAPES[k]]; }), st.shape);
    }
    $('pz-shape-row').hidden = !p.shapes;

    var wrap = $('pz-texts');
    wrap.innerHTML = '';
    p.texts.forEach(function (t, i) {
      var l = document.createElement('label');
      l.className = 'pz-field';
      var s = document.createElement('span'); s.textContent = t[0];
      var inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 80; inp.value = t[1]; inp.dataset.i = i;
      inp.addEventListener('input', function () { st.texts[i] = inp.value; render(true); });
      l.appendChild(s); l.appendChild(inp); wrap.appendChild(l);
    });

    var pre = $('pz-presets');
    pre.innerHTML = '';
    PRESETS.forEach(function (pr) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pz-sw'; b.title = pr.n; b.setAttribute('aria-label', 'Cores: ' + pr.n);
      b.style.background = 'linear-gradient(135deg,' + pr.c[0] + ' 50%,' + pr.c[2] + ' 50%)';
      b.addEventListener('click', function () {
        st.bg = pr.c[0]; st.tx = pr.c[1]; st.ac = pr.c[2];
        syncControls(); render(true);
      });
      pre.appendChild(b);
    });
  }

  function syncControls() {
    $('pz-mode').value = st.mode;
    $('pz-fit').value = st.fit;
    $('pz-zoom').value = Math.round(st.zoom * 100);
    $('pz-bg').value = st.bg; $('pz-tx').value = st.tx; $('pz-ac').value = st.ac;
    $('pz-rm').hidden = !st.img;
    $('pz-adjust').hidden = !st.img;
  }

  $('pz-file').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !st) { return; }
    if (!/^image\//.test(f.type)) { alert('Escolha um arquivo de imagem (JPG, PNG, WebP ou SVG).'); return; }
    var url = URL.createObjectURL(f);
    var im = new Image();
    im.onload = function () {
      if (!st) { return; }
      st.img = im; st.ox = 0; st.oy = 0; st.zoom = 1;
      syncControls(); render(true);
    };
    im.onerror = function () { alert('Não consegui abrir essa imagem. Tente outro arquivo.'); };
    im.src = url;
  });
  $('pz-rm').addEventListener('click', function () {
    st.img = null; $('pz-file').value = ''; syncControls(); render(true);
  });
  $('pz-mode').addEventListener('change', function (e) { st.mode = e.target.value; st.ox = st.oy = 0; render(true); });
  $('pz-fit').addEventListener('change', function (e) { st.fit = e.target.value; st.ox = st.oy = 0; render(true); });
  $('pz-zoom').addEventListener('input', function (e) { st.zoom = e.target.value / 100; render(true); });
  $('pz-shape').addEventListener('change', function (e) { st.shape = e.target.value; render(true); });
  $('pz-size').addEventListener('change', function (e) { st.size = +e.target.value; render(true); });
  $('pz-bg').addEventListener('input', function (e) { st.bg = e.target.value; render(true); });
  $('pz-tx').addEventListener('input', function (e) { st.tx = e.target.value; render(true); });
  $('pz-ac').addEventListener('input', function (e) { st.ac = e.target.value; render(true); });

  /* arrastar a foto e zoom com a roda do mouse */
  var drag = null;
  canvas.addEventListener('pointerdown', function (e) {
    if (!st || !st.img) { return; }
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('grab');
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drag || !box) { return; }
    var k = W / canvas.getBoundingClientRect().width;
    var dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
    drag.x = e.clientX; drag.y = e.clientY;
    if (box.rx > 0) { st.ox = clamp(st.ox + dx / box.rx, -1, 1); }
    if (box.ry > 0) { st.oy = clamp(st.oy + dy / box.ry, -1, 1); }
    render(true);
  });
  function endDrag() { drag = null; canvas.classList.remove('grab'); }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', function (e) {
    if (!st || !st.img) { return; }
    e.preventDefault();
    st.zoom = clamp(st.zoom * (e.deltaY < 0 ? 1.08 : 0.93), 1, 3);
    $('pz-zoom').value = Math.round(st.zoom * 100);
    render(true);
  }, { passive: false });

  /* ---------- desenho ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function effAspect() {
    return st.shape === 'circulo' ? 1 : st.p.sizes[st.size].a;
  }

  function path(x, y, w, h, shape) {
    ctx.beginPath();
    if (shape === 'circulo') {
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (shape === 'arredondado') {
      rr(x, y, w, h, Math.min(w, h) * 0.09);
    } else {
      ctx.rect(x, y, w, h);
    }
  }
  function rr(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPhoto(bx, by, bw, bh, radius, track) {
    ctx.save();
    ctx.beginPath();
    if (radius) { rr(bx, by, bw, bh, radius); } else { ctx.rect(bx, by, bw, bh); }
    ctx.clip();
    if (st.fit === 'contain') { ctx.fillStyle = 'rgba(127,127,127,.12)'; ctx.fillRect(bx, by, bw, bh); }
    var iw = st.img.naturalWidth || st.img.width, ih = st.img.naturalHeight || st.img.height;
    var base = st.fit === 'cover' ? Math.max(bw / iw, bh / ih) : Math.min(bw / iw, bh / ih);
    var s = base * st.zoom, dw = iw * s, dh = ih * s;
    var rx = Math.abs(dw - bw) / 2, ry = Math.abs(dh - bh) / 2;
    var x = bx + (bw - dw) / 2 + st.ox * rx, y = by + (bh - dh) / 2 + st.oy * ry;
    ctx.drawImage(st.img, x, y, dw, dh);
    ctx.restore();
    if (track) { box = { rx: rx, ry: ry }; }
  }

  function placeholder(bx, by, bw, bh, radius) {
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = st.ac;
    ctx.beginPath();
    if (radius) { rr(bx + 2, by + 2, bw - 4, bh - 4, radius); } else { ctx.rect(bx + 2, by + 2, bw - 4, bh - 4); }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = st.ac;
    ctx.globalAlpha = 0.9;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '600 ' + Math.max(16, Math.min(bw, bh) * 0.1) + 'px "DM Sans",sans-serif';
    ctx.fillText('Sua foto aqui', bx + bw / 2, by + bh / 2);
    ctx.restore();
  }

  function wrap(text, maxW) {
    var words = text.split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else { cur = t; }
    });
    if (cur) { lines.push(cur); }
    return lines.slice(0, 3);
  }

  // Desenha o bloco de texto dentro da região r = {x,y,w,h}
  function drawText(r, align, anchor, color, u, onPhoto) {
    var items = [];
    st.texts.forEach(function (t, i) {
      t = (t || '').trim();
      if (!t) { return; }
      var big = i === 0, mid = i === 1;
      var size = u * (big ? 0.13 : mid ? 0.078 : 0.062);
      var weight = big ? '800' : (mid ? '600' : '500');
      var fam = big ? '"Bricolage Grotesque"' : '"DM Sans"';
      items.push({ t: t, size: size, weight: weight, fam: fam, big: big, mid: mid });
    });
    if (!items.length) { return; }
    var lines = [];
    items.forEach(function (it) {
      ctx.font = it.weight + ' ' + it.size + 'px ' + it.fam + ',sans-serif';
      if (it.big) {
        while (it.size > 12 && ctx.measureText(it.t).width > r.w) {
          it.size -= 2; ctx.font = it.weight + ' ' + it.size + 'px ' + it.fam + ',sans-serif';
        }
        lines.push({ t: it.t, it: it, gap: it.size * 0.25 });
      } else {
        wrap(it.t, r.w).forEach(function (ln) { lines.push({ t: ln, it: it, gap: it.size * 0.3 }); });
      }
    });
    var total = 0;
    lines.forEach(function (l) { l.h = l.it.size * 1.12; total += l.h + l.gap; });
    total -= lines[lines.length - 1].gap;
    var y = anchor === 'bottom' ? r.y + r.h - total : r.y + (r.h - total) / 2;
    if (y < r.y) { y = r.y; }
    ctx.textBaseline = 'top';
    ctx.textAlign = align;
    var x = align === 'center' ? r.x + r.w / 2 : r.x;
    lines.forEach(function (l) {
      ctx.font = l.it.weight + ' ' + l.it.size + 'px ' + l.it.fam + ',sans-serif';
      ctx.fillStyle = l.it.mid && !onPhoto ? st.ac : color;
      ctx.fillText(l.t, x, y);
      y += l.h + l.gap;
    });
  }

  function render(preview) {
    if (!st) { return; }
    var a = effAspect();
    var H = Math.round(W / a);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.clearRect(0, 0, W, H);
    box = null;
    var shape = st.shape, p = st.p;
    var u = Math.min(W, H);

    // borda branca de adesivo
    var bw = 0;
    if (p.border) {
      path(0, 0, W, H, shape); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      bw = u * 0.035;
    }
    ctx.save();
    path(bw, bw, W - 2 * bw, H - 2 * bw, shape);
    ctx.clip();
    ctx.fillStyle = st.bg; ctx.fillRect(0, 0, W, H);

    var x0 = bw, y0 = bw, w0 = W - 2 * bw, h0 = H - 2 * bw;
    var pad = u * (shape === 'circulo' ? 0.16 : 0.07);
    var hasText = st.texts.some(function (t) { return (t || '').trim(); });
    var light = st.tx;

    if (st.mode === 'fundo') {
      if (st.img) {
        drawPhoto(x0, y0, w0, h0, 0, true);
        if (hasText) {
          var g = ctx.createLinearGradient(0, y0 + h0 * 0.45, 0, y0 + h0);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.7)');
          ctx.fillStyle = g; ctx.fillRect(x0, y0, w0, h0);
        }
        light = '#FFFFFF';
      } else if (preview) {
        placeholder(x0 + pad / 2, y0 + pad / 2, w0 - pad, h0 - pad, shape === 'circulo' ? Math.min(w0, h0) / 2 : 0);
      }
      var cx = shape === 'circulo' ? W * 0.2 : x0 + pad;
      drawText({ x: cx, y: y0 + h0 * 0.5, w: W - 2 * cx, h: h0 * 0.5 - pad }, shape === 'circulo' ? 'center' : 'left', 'bottom', light, u, !!st.img);
    } else if (st.mode === 'logo') {
      var land = w0 / h0 >= 1.25;
      if (p.bar === 'top') { ctx.fillStyle = st.ac; ctx.fillRect(x0, y0, w0, u * 0.035); }
      if (p.bar === 'bottom') { ctx.fillStyle = st.ac; ctx.fillRect(x0, y0 + h0 - u * 0.04, w0, u * 0.04); }
      var r = u * 0.05;
      if (land) {
        var S = Math.min(h0 * 0.6, w0 * 0.36);
        var bx = x0 + pad, by = y0 + (h0 - S) / 2;
        if (st.img) { drawPhoto(bx, by, S, S, r, true); } else if (preview) { placeholder(bx, by, S, S, r); }
        var tx0 = bx + S + pad * 0.8;
        drawText({ x: tx0, y: y0 + pad, w: x0 + w0 - pad - tx0, h: h0 - 2 * pad }, 'left', 'center', st.tx, u);
      } else {
        var S2 = Math.min(w0 * 0.5, h0 * 0.42);
        var bx2 = x0 + (w0 - S2) / 2, by2 = y0 + pad * (shape === 'circulo' ? 1.1 : 1.3);
        if (st.img) { drawPhoto(bx2, by2, S2, S2, r, true); } else if (preview) { placeholder(bx2, by2, S2, S2, r); }
        var ty = by2 + S2 + pad * 0.6;
        drawText({ x: x0 + pad, y: ty, w: w0 - 2 * pad, h: y0 + h0 - ty - pad }, 'center', 'top', st.tx, u);
      }
    } else { // faixa
      var bh = h0 * (w0 / h0 < 1 ? 0.5 : 0.55);
      if (st.img) { drawPhoto(x0, y0, w0, bh, 0, true); } else if (preview) { placeholder(x0 + pad / 2, y0 + pad / 2, w0 - pad, bh - pad, 0); }
      ctx.fillStyle = st.ac; ctx.fillRect(x0, y0 + bh, w0, u * 0.02);
      var ty2 = y0 + bh + u * 0.02 + pad * 0.7;
      drawText({ x: x0 + pad, y: ty2, w: w0 - 2 * pad, h: y0 + h0 - ty2 - pad * 0.7 }, 'left', 'top', st.tx, u);
    }
    ctx.restore();
    updateWhats();
  }

  function updateWhats() {
    var p = st.p, s = p.sizes[st.size];
    var msg = 'Olá! Quero fazer um orçamento de: ' + p.nome + ' personalizado.\nTamanho: ' + s.l;
    if (p.shapes) { msg += '\nFormato: ' + SHAPES[st.shape]; }
    var lines = [];
    p.texts.forEach(function (t, i) { if ((st.texts[i] || '').trim()) { lines.push(t[0] + ': ' + st.texts[i].trim()); } });
    if (lines.length) { msg += '\n' + lines.join('\n'); }
    msg += '\n\nVou enviar a prévia (imagem) em seguida.';
    $('pz-wa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
  }

  $('pz-dl').addEventListener('click', function () {
    if (!st) { return; }
    render(false);
    var name = 'mega-impressos-' + st.key + '.png';
    canvas.toBlob(function (blob) {
      render(true);
      if (!blob) { return; }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, 'image/png');
  });
})();
