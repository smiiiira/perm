(function () {
  var list = document.getElementById('guides-list'); if (!list) return;
  var title = document.getElementById('guides-title');
  var all = Array.prototype.slice.call(list.querySelectorAll('.tile'));
  function select(gis) {
    title.textContent = gis ? 'Аудиогиды маршрута' : 'Все аудиогиды';
    all.forEach(function(tile){ tile.hidden = !!gis && tile.dataset.gis !== gis; });
  }
  document.querySelectorAll('.gis-mock-route').forEach(function(btn){ btn.addEventListener('click', function(){ select(btn.dataset.gis || ''); }); });
})();
