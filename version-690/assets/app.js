(function() {
  var heroIndex = 0;
  var heroTimer = null;

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  function showHero(index) {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function(slide, pos) {
      slide.classList.toggle('is-active', pos === heroIndex);
    });
    dots.forEach(function(dot, pos) {
      dot.classList.toggle('is-active', pos === heroIndex);
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (slides.length <= 1) {
      return;
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showHero(index);
        restartHero();
      });
    });
    restartHero();
  }

  function restartHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    heroTimer = window.setInterval(function() {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function openSearch(query) {
    var modal = document.querySelector('.search-modal');
    var list = document.querySelector('.search-results');
    if (!modal || !list) {
      return;
    }
    var source = window.SEARCH_ITEMS || [];
    var keyword = String(query || '').trim().toLowerCase();
    var matches = source.filter(function(item) {
      var text = [item.t, item.g, item.c, item.y, item.r].join(' ').toLowerCase();
      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 36);
    if (!matches.length) {
      list.innerHTML = '<p class="empty-result">没有找到匹配影片</p>';
    } else {
      list.innerHTML = matches.map(function(item) {
        return '<a class="search-result-item" href="' + escapeAttr(item.u) + '">' +
          '<img src="' + escapeAttr(item.i) + '" alt="' + escapeAttr(item.t) + '">' +
          '<span><strong>' + escapeHtml(item.t) + '</strong><p>' + escapeHtml(item.y + ' · ' + item.r + ' · ' + item.g) + '</p></span>' +
          '</a>';
      }).join('');
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeSearch() {
    var modal = document.querySelector('.search-modal');
    if (!modal) {
      return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function setupSearch() {
    selectAll('.search-form, .mobile-search-form').forEach(function(form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        var input = form.querySelector('.search-input');
        openSearch(input ? input.value : '');
      });
    });
    var close = document.querySelector('.search-close');
    var backdrop = document.querySelector('.search-modal-backdrop');
    if (close) {
      close.addEventListener('click', closeSearch);
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeSearch);
    }
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeSearch();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function initPlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var shell = document.querySelector('.video-shell');
    var button = document.querySelector('.player-start');
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function loadAndPlay() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      if (shell) {
        shell.classList.add('is-playing');
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function() {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
    video.addEventListener('click', function() {
      if (!loaded) {
        loadAndPlay();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer,
    openSearch: openSearch
  };

  document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
