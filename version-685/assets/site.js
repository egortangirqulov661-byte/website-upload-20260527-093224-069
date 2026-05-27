(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(next);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }
    var cards = Array.from(list.querySelectorAll('[data-title]'));
    var search = document.querySelector('[data-movie-search]');
    var category = document.querySelector('[data-category-filter]');
    var year = document.querySelector('[data-year-filter]');
    var count = document.querySelector('[data-visible-count]');

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-category') || ''
      ].join(' ').toLowerCase();
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var c = category ? category.value : 'all';
      var y = year ? year.value.trim() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var matchText = !q || textOf(card).indexOf(q) !== -1;
        var matchCategory = c === 'all' || card.getAttribute('data-category') === c;
        var matchYear = !y || (card.getAttribute('data-year') || '').indexOf(y) !== -1;
        var show = matchText && matchCategory && matchYear;
        card.classList.toggle('is-hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible;
      }
    }

    [search, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var buttons = Array.from(document.querySelectorAll('[data-play-button]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var card = button.closest('[data-player-card]');
        var video = card ? card.querySelector('[data-video-player]') : null;
        var status = card ? card.querySelector('[data-player-status]') : null;
        var source = button.getAttribute('data-src');
        if (!video || !source) {
          return;
        }

        function setStatus(message) {
          if (status) {
            status.textContent = message;
          }
        }

        setStatus('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().then(function () {
            card.classList.add('is-playing');
          }).catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
            card.classList.add('is-playing');
          });
          return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
          .then(function () {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
              hls.loadSource(source);
              hls.attachMedia(video);
              hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                  card.classList.add('is-playing');
                  setStatus('正在播放');
                }).catch(function () {
                  card.classList.add('is-playing');
                  setStatus('播放源已就绪，请点击视频播放。');
                });
              });
              hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                  setStatus('播放源加载失败，请检查网络或稍后重试。');
                }
              });
            } else {
              video.src = source;
              card.classList.add('is-playing');
              video.play().catch(function () {
                setStatus('当前浏览器不支持 HLS 播放。');
              });
            }
          })
          .catch(function () {
            video.src = source;
            card.classList.add('is-playing');
            video.play().catch(function () {
              setStatus('HLS 脚本加载失败，请检查网络后重试。');
            });
          });
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
