/* Audio player (TZ 2.4): play/pause, seek, timecode, volume, speed,
   resume position via localStorage, keyboard: Space play/pause, arrows seek. */
(function () {
  var audio = document.getElementById('audio-player');
  if (!audio) return;
  var slug = audio.dataset.slug;
  var storageKey = 'audio-position:' + slug;
  var toggle = document.getElementById('player-toggle');
  var time = document.getElementById('player-time');
  var seek = document.getElementById('player-seek');
  var volume = document.getElementById('player-volume');
  var speeds = document.querySelectorAll('.player__speed');

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function update() {
    var d = audio.duration || 0;
    time.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
    if (d) seek.value = String((audio.currentTime / d) * 100);
  }

  // Resume position (TZ 2.4)
  audio.addEventListener('loadedmetadata', function () {
    var saved = parseFloat(localStorage.getItem(storageKey));
    if (saved && saved > 5 && saved < audio.duration - 10) {
      audio.currentTime = saved;
    }
    update();
  });

  audio.addEventListener('timeupdate', function () {
    update();
    try { localStorage.setItem(storageKey, String(audio.currentTime)); } catch (e) { /* private mode */ }
  });

  audio.addEventListener('play', function () {
    toggle.textContent = '⏸';
    toggle.setAttribute('aria-label', 'Пауза');
    window.trackGoal && window.trackGoal('audio-play-start'); // TZ 9.2 goal
  });
  audio.addEventListener('pause', function () {
    toggle.textContent = '▶';
    toggle.setAttribute('aria-label', 'Слушать');
  });
  audio.addEventListener('ended', function () {
    try { localStorage.removeItem(storageKey); } catch (e) { /* noop */ }
  });

  toggle.addEventListener('click', function () {
    if (audio.paused) audio.play(); else audio.pause();
  });

  seek.addEventListener('input', function () {
    if (audio.duration) audio.currentTime = (parseFloat(seek.value) / 100) * audio.duration;
  });

  volume.addEventListener('input', function () {
    audio.volume = parseFloat(volume.value);
  });

  speeds.forEach(function (btn) {
    btn.addEventListener('click', function () {
      audio.playbackRate = parseFloat(btn.dataset.speed);
      speeds.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
    });
  });

  // Keyboard accessibility (TZ 6.6)
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea, select')) return;
    if (e.code === 'Space' && !e.target.closest('a, button')) {
      e.preventDefault();
      if (audio.paused) audio.play(); else audio.pause();
    }
    if (e.code === 'ArrowRight') audio.currentTime += 5;
    if (e.code === 'ArrowLeft') audio.currentTime -= 5;
  });
})();
