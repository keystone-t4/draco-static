(function () {
  'use strict';

  function initShowcase(root) {
    var dataScript = root.querySelector('[data-showcase-products]');
    if (!dataScript) return;

    var products;
    try {
      products = JSON.parse(dataScript.textContent);
    } catch (e) {
      console.error('Invalid product data for showcase', e);
      return;
    }
    if (!Array.isArray(products) || products.length === 0) return;

    dataScript.remove();

    var imageBase = 'assets/images/products/';
    var active = 0;

    var counter = document.createElement('div');
    counter.className = 'showcase__controls';
    counter.innerHTML =
      '<span class="showcase__counter"><strong></strong> / <span></span></span>' +
      '<div class="showcase__nav">' +
      '<button type="button" class="showcase__btn" data-prev aria-label="Previous product">←</button>' +
      '<button type="button" class="showcase__btn showcase__btn--dark" data-next aria-label="Next product">→</button>' +
      '</div>';

    var grid = document.createElement('div');
    grid.className = 'showcase__grid';
    grid.innerHTML =
      '<div class="showcase__detail">' +
        '<div class="showcase__detail-img">' +
          '<img class="showcase__detail-photo" alt="">' +
          '<span class="showcase__badge"></span>' +
        '</div>' +
        '<div class="showcase__body">' +
          '<div>' +
            '<h3 class="showcase__name"></h3>' +
            '<p class="showcase__tag"></p>' +
            '<div class="showcase__chips-block" hidden>' +
              '<div class="showcase__chips-label"></div>' +
              '<div class="showcase__chips"></div>' +
            '</div>' +
            '<div class="showcase__grades" hidden></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="showcase__previews">' +
        '<div class="showcase__scroll" data-scroll></div>' +
        '<a href="#contact" class="showcase__quote">' +
          '<span class="showcase__quote-icon">↗</span>' +
          '<span class="showcase__quote-text">Request a quote for<br><span class="showcase__quote-name"></span></span>' +
        '</a>' +
      '</div>';

    root.appendChild(counter);
    root.appendChild(grid);

    var els = {
      activeLabel: counter.querySelector('.showcase__counter strong'),
      totalLabel: counter.querySelector('.showcase__counter span'),
      prevBtn: counter.querySelector('[data-prev]'),
      nextBtn: counter.querySelector('[data-next]'),
      photo: grid.querySelector('.showcase__detail-photo'),
      badge: grid.querySelector('.showcase__badge'),
      name: grid.querySelector('.showcase__name'),
      tag: grid.querySelector('.showcase__tag'),
      chipsBlock: grid.querySelector('.showcase__chips-block'),
      chipsLabel: grid.querySelector('.showcase__chips-label'),
      chips: grid.querySelector('.showcase__chips'),
      grades: grid.querySelector('.showcase__grades'),
      scroll: grid.querySelector('[data-scroll]'),
      quoteName: grid.querySelector('.showcase__quote-name')
    };

    function pad(n) { return String(n).padStart(2, '0'); }

    function render() {
      var n = products.length;
      if (active >= n) active = n - 1;
      if (active < 0) active = 0;
      var cur = products[active];

      els.activeLabel.textContent = pad(active + 1);
      els.totalLabel.textContent = pad(n);

      els.photo.src = imageBase + cur.slotId + '.webp';
      els.photo.alt = cur.name;
      els.badge.textContent = cur.badge || '';
      els.name.textContent = cur.name;
      els.tag.textContent = cur.tag;
      els.quoteName.textContent = cur.name;

      if (cur.list && cur.list.length) {
        els.chipsBlock.hidden = false;
        els.chipsLabel.textContent = cur.listLabel || '';
        els.chips.innerHTML = '';
        cur.list.forEach(function (item) {
          var chip = document.createElement('span');
          chip.className = 'showcase__chip';
          chip.textContent = item;
          els.chips.appendChild(chip);
        });
      } else {
        els.chipsBlock.hidden = true;
      }

      if (cur.gradesText) {
        els.grades.hidden = false;
        els.grades.innerHTML = '<strong>' + escapeHtml(cur.gradesLabel || 'Grades') + ':</strong> ' + escapeHtml(cur.gradesText);
      } else {
        els.grades.hidden = true;
      }

      els.scroll.innerHTML = '';
      products.forEach(function (p, i) {
        if (i === active) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'showcase__preview';
        btn.setAttribute('data-index', String(i));
        btn.innerHTML =
          '<img class="showcase__preview-photo" src="' + imageBase + p.slotId + '.webp" alt="' + escapeHtml(p.name) + '">' +
          '<span class="showcase__preview-gradient"></span>' +
          '<span class="showcase__preview-badge">' + escapeHtml(p.badge || '') + '</span>' +
          '<span class="showcase__preview-name">' + escapeHtml(p.name) + '</span>';
        btn.addEventListener('click', function () {
          active = i;
          render();
        });
        els.scroll.appendChild(btn);
      });
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    els.prevBtn.addEventListener('click', function () {
      active = (active - 1 + products.length) % products.length;
      render();
    });
    els.nextBtn.addEventListener('click', function () {
      active = (active + 1) % products.length;
      render();
    });

    render();
  }

  function init() {
    document.querySelectorAll('[data-showcase]').forEach(initShowcase);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
