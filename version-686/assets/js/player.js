import { H as Hls } from './video-vendor-dru42stk.js';

function initializeVideo(video) {
  if (!video || video.dataset.ready === 'true') {
    return;
  }

  const source = video.dataset.hlsSrc;
  if (!source) {
    return;
  }

  video.dataset.ready = 'true';

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }
}

document.querySelectorAll('[data-play-button]').forEach(function (button) {
  button.addEventListener('click', function () {
    const shell = button.closest('.video-shell');
    const video = shell ? shell.querySelector('video[data-hls-src]') : null;

    initializeVideo(video);

    if (video) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    button.classList.add('is-hidden');
  });
});

document.querySelectorAll('video[data-hls-src]').forEach(function (video) {
  video.addEventListener('play', function () {
    initializeVideo(video);
    const shell = video.closest('.video-shell');
    const button = shell ? shell.querySelector('[data-play-button]') : null;
    if (button) {
      button.classList.add('is-hidden');
    }
  }, { once: true });
});
