(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function getBase() {
    return document.body.dataset.base || '';
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function initCardFilters() {
    qsa('[data-card-filter]').forEach(function (panel) {
      var textInput = qs('[data-filter-text]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var regionSelect = qs('[data-filter-region]', panel);
      var resetButton = qs('[data-filter-reset]', panel);
      var list = qs('[data-filter-list]') || panel.nextElementSibling;
      if (!list) {
        return;
      }
      var cards = qsa('[data-title]', list);

      function apply() {
        var text = (textInput && textInput.value || '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value || '';
        var region = regionSelect && regionSelect.value || '';
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || '',
            card.dataset.genre || '',
            card.dataset.region || '',
            card.dataset.year || ''
          ].join(' ').toLowerCase();
          var matchedText = !text || haystack.indexOf(text) !== -1;
          var matchedYear = !year || card.dataset.year === year;
          var matchedRegion = !region || card.dataset.region === region;
          card.classList.toggle('is-hidden-by-filter', !(matchedText && matchedYear && matchedRegion));
        });
      }

      [textInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (textInput) {
            textInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video[data-src]', shell);
      var startButton = qs('[data-player-start]', shell);
      if (!video || !startButton) {
        return;
      }
      var loaded = false;
      function loadAndPlay() {
        if (!loaded) {
          var source = video.dataset.src;
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          loaded = true;
        }
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }
      startButton.addEventListener('click', loadAndPlay);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    });
  }

  function createResultCard(movie, base) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + base + escapeHtml(movie.url) + '">' +
          '<img src="' + base + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.score) + ' 分</span>' +
          '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<a class="card-title" href="' + base + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
          '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year || '未知') + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = qs('#searchResults');
    var input = qs('#searchPageInput');
    var status = qs('#searchStatus');
    if (!results || !input || !status || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(searchText) {
      var keyword = searchText.trim().toLowerCase();
      if (!keyword) {
        status.textContent = '请输入关键词进行搜索';
        results.innerHTML = '';
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.year,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      status.textContent = '找到 ' + matched.length + ' 条相关结果';
      results.innerHTML = matched.map(function (movie) {
        return createResultCard(movie, getBase());
      }).join('');
    }

    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCardFilters();
    initPlayers();
    initSearchPage();
  });
})();
