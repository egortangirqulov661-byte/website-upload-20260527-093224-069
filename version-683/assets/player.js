(function () {
  var video = document.getElementById('movie-video');
  var overlay = document.querySelector('.play-overlay');
  var source = window.__currentVideoUrl;
  var started = false;

  function loadScript(url, callback) {
    var existing = document.querySelector('script[src="' + url + '"]');
    if (existing) {
      existing.addEventListener('load', callback);
      if (window.Hls) {
        callback();
      }
      return;
    }
    var script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function attachSource(callback) {
    if (!video || !source) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      callback();
      return;
    }
    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js', function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__hlsInstance) {
          video.__hlsInstance = new window.Hls();
          video.__hlsInstance.loadSource(source);
          video.__hlsInstance.attachMedia(video);
        }
        callback();
      } else {
        video.src = source;
        callback();
      }
    });
  }

  function startPlay() {
    if (!video || started) {
      if (video) {
        video.play();
      }
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add('hidden');
    }
    attachSource(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          started = false;
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', startPlay);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  }
})();
