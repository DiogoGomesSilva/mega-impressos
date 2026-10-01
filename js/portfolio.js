/* Portfólio: posts do Instagram @megaimpressos3, na mesma ordem do perfil (mais recente primeiro).
   Para atualizar: adicione o novo post NO TOPO da lista abaixo.
   Formato: ['p' ou 'reel', 'código do post na URL', 'descrição'].
   Ex.: instagram.com/reel/ABC123/  ->  ['reel', 'ABC123', 'Descrição'] */
(function () {
  'use strict';
  var POSTS = [
    ['p', 'Db0sMW4OGNN', 'Dia dos Pais'],
    ['p', 'DbRLY1Xv059', 'Dia dos Avós'],
    ['reel', 'DXM7e37gJxQ', 'Cards personalizados'],
    ['p', 'DXIJ0VXDoC9', 'Bomboniere personalizada'],
    ['p', 'DXIG6elFuL-', 'Kit caneca e porta-cartões'],
    ['p', 'DXIEvMgDk_l', 'Cesta Presenteie com amor'],
    ['reel', 'DW8t9lsjgA3', 'Máquina cortando adesivos'],
    ['reel', 'DW68n0Hjh8x', 'Corte de papel na guilhotina'],
    ['reel', 'DW6k6iNEtGj', 'Lembrancinhas personalizadas'],
    ['p', 'DW5P0a8jNOW', 'Mega Impressos'],
    ['reel', 'DW4v9ZPj4B8', 'Caneta personalizada'],
    ['reel', 'DW4DZiYjtB5', 'Placa de sinalização em PVC']
  ];
  var STEP = 3;

  var grid = document.getElementById('works');
  var btn = document.getElementById('more-works');
  if (!grid || !btn) { return; }
  var shown = 0;

  function add(n) {
    var end = Math.min(shown + n, POSTS.length);
    for (; shown < end; shown++) {
      var p = POSTS[shown];
      var f = document.createElement('figure');
      f.className = 'work';
      var i = document.createElement('iframe');
      i.src = 'https://www.instagram.com/' + p[0] + '/' + p[1] + '/embed/';
      i.title = p[2] + ' – Instagram da Mega Impressos';
      i.loading = 'lazy';
      i.setAttribute('allowfullscreen', '');
      i.setAttribute('scrolling', 'no');
      f.appendChild(i);
      grid.appendChild(f);
    }
    update();
  }
  function update() {
    var all = shown >= POSTS.length;
    btn.textContent = all ? 'Ver menos' : 'Ver mais trabalhos';
    btn.setAttribute('aria-expanded', all ? 'true' : (shown > STEP ? 'true' : 'false'));
    btn.hidden = POSTS.length <= STEP;
  }
  btn.addEventListener('click', function () {
    if (shown >= POSTS.length) {
      while (grid.children.length > STEP) { grid.removeChild(grid.lastChild); }
      shown = STEP;
      update();
      document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
    } else {
      add(STEP);
    }
  });
  add(STEP);
})();
