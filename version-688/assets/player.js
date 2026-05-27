(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector('.movie-video');
    var cover = shell.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    var mediaUrl = video.getAttribute('data-play');
    var started = false;
    var hls = null;

    function loadVideo() {
      if (!mediaUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          autoStartLoad: true,
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function playVideo() {
      if (!started) {
        started = true;
        loadVideo();
        video.setAttribute('controls', 'controls');
        cover.classList.add('is-hidden');
      }

      var playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {});
      }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });
    video.addEventListener('ended', function () {
      if (hls && typeof hls.stopLoad === 'function') {
        hls.stopLoad();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(attachPlayer);
})();
