(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindSource(video) {
    var src = video.getAttribute("data-src");

    if (!src || video.getAttribute("data-ready") === "1") {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = src;
    }

    video.setAttribute("data-ready", "1");
  }

  function playVideo(player) {
    var video = player.querySelector("video");

    if (!video) {
      return;
    }

    bindSource(video);
    player.classList.add("is-playing");

    var playback = video.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        player.classList.remove("is-playing");
      });
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-player-trigger]");

      if (trigger) {
        trigger.addEventListener("click", function () {
          playVideo(player);
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo(player);
          }
        });

        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  });
})();
