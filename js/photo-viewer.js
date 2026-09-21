/* Photo viewer (TZ 2.7) — built from scratch.
   The overlay is created entirely in JS and appended to <body>, so it always
   renders on top of everything. Image is contained within the viewport,
   close X in the corner, arrows beside the image, swipe on touch, keyboard. */
(function () {
  'use strict';

  var state = { items: [], index: -1, lastFocus: null };

  // ---- build the overlay once
  var root = document.createElement('div');
  root.className = 'pv';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Просмотр фотографии');
  root.hidden = true;
  root.innerHTML =
    '<div class="pv__top">' +
    '  <span class="pv__counter" aria-live="polite"></span>' +
    '  <button type="button" class="pv__btn pv__btn--close" data-pv="close" aria-label="Закрыть (Esc)">\u2715</button>' +
    '</div>' +
    '<div class="pv__row">' +
    '  <button type="button" class="pv__btn" data-pv="prev" aria-label="Предыдущее фото">\u2039</button>' +
    '  <img class="pv__img" alt="" draggable="false">' +
    '  <button type="button" class="pv__btn" data-pv="next" aria-label="Следующее фото">\u203A</button>' +
    '</div>' +
    '<div class="pv__caption"></div>';
  document.body.appendChild(root);

  var img = root.querySelector('.pv__img');
  var caption = root.querySelector('.pv__caption');
  var counter = root.querySelector('.pv__counter');

  function items() {
    return Array.prototype.slice.call(document.querySelectorAll('.lightbox-trigger'));
  }

  function render() {
    var item = state.items[state.index];
    if (!item) return;
    img.src = item.dataset.full;
    img.alt = item.getAttribute('aria-label') || '';
    caption.textContent = item.dataset.caption || '';
    counter.textContent = (state.index + 1) + ' / ' + state.items.length;
    // restart pop animation
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = '';
    // preload neighbours for instant flipping
    [1, -1].forEach(function (d) {
      var n = state.items[(state.index + d + state.items.length) % state.items.length];
      if (n) { var i = new Image(); i.src = n.dataset.full; }
    });
  }

  function open(index) {
    state.items = items();
    if (index < 0 || index >= state.items.length) return;
    state.index = index;
    state.lastFocus = document.activeElement;
    render();
    root.classList.add('is-open');
    root.hidden = false;
    root.querySelector('[data-pv="close"]').focus();
  }

  function close() {
    root.classList.add('is-closing');
    setTimeout(function () {
      root.classList.remove('is-open');
      root.hidden = true;
      root.classList.remove('is-closing');
      if (state.lastFocus) state.lastFocus.focus();
    }, 140);
  }

  function move(delta) {
    state.index = (state.index + delta + state.items.length) % state.items.length;
    render();
  }

  // ---- events
  // Open: event delegation, so photos added via "show more" work automatically
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.lightbox-trigger');
    if (!t) return;
    open(items().indexOf(t));
  });

  root.addEventListener('click', function (e) {
    var action = e.target.closest('[data-pv]');
    if (action) {
      var a = action.dataset.pv;
      if (a === 'close') close();
      if (a === 'prev') move(-1);
      if (a === 'next') move(1);
      return;
    }
    if (e.target === root) close(); // click on the dark backdrop
  });

  document.addEventListener('keydown', function (e) {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  // ---- touch swipe: image follows the finger, release snaps / flips
  var startX = null;
  root.addEventListener('touchstart', function (e) {
    if (!e.target.closest('.pv__img')) return;
    startX = e.touches[0].clientX;
    root.classList.add('is-dragging');
  }, { passive: true });
  root.addEventListener('touchmove', function (e) {
    if (startX === null) return;
    img.style.transition = 'none';
    img.style.transform = 'translateX(' + ((e.touches[0].clientX - startX) * 0.4) + 'px)';
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    root.classList.remove('is-dragging');
    img.style.transition = 'transform .18s ease';
    img.style.transform = '';
    if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
