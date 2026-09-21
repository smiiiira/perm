/* Shared client scripts: mobile menu, share buttons, Metrika goals. */

// Mobile menu
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
});

// Share: copy link + analytics goals (TZ 9.2)
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-share]');
  if (!btn) return;
  trackGoal('share-click');
  if (btn.dataset.share === 'copy') {
    e.preventDefault();
    var url = btn.dataset.url || window.location.href;
    var done = function () {
      btn.textContent = 'Ссылка скопирована';
      setTimeout(function () { btn.textContent = 'Скопировать ссылку'; }, 2500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done);
    else {
      var ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    }
  }
});

// Downloads / route selection goals are tracked where elements carry data-goal
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-goal]');
  if (el) trackGoal(el.dataset.goal);
});

// Yandex.Metrika goals helper (counter id comes from config; safe no-op when disabled)
window.trackGoal = function (name) {
  if (window.ym && document.body.dataset.metrikaId) {
    window.ym(document.body.dataset.metrikaId, 'reachGoal', name);
  }
};
