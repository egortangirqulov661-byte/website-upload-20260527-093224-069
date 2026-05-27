(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function getText(card, name) {
    return (card.getAttribute("data-" + name) || "").toLowerCase();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    roots.forEach(function (root) {
      var scope = root.parentElement || document;
      var input = root.querySelector("[data-search-input]");
      var year = root.querySelector("[data-year-filter]");
      var region = root.querySelector("[data-region-filter]");
      var type = root.querySelector("[data-type-filter]");
      var container = scope.querySelector("[data-card-container]") || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .ranking-row"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value.toLowerCase() : "";
        var selectedRegion = region ? region.value.toLowerCase() : "";
        var selectedType = type ? type.value.toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = ["title", "year", "region", "type", "genre"].map(function (key) {
            return getText(card, key);
          }).join(" ");
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (selectedYear && getText(card, "year") !== selectedYear) {
            matched = false;
          }

          if (selectedRegion && getText(card, "region") !== selectedRegion) {
            matched = false;
          }

          if (selectedType && getText(card, "type") !== selectedType) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (item) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[item];
    });
  }

  function createSearchCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a href="' + escapeHtml(movie.url) + '" class="card-link">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-shine"></span>',
      '    <span class="card-play">立即播放</span>',
      '    <span class="card-info">',
      '      <strong>' + escapeHtml(movie.title) + '</strong>',
      '      <em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
      '      <small>' + escapeHtml(movie.oneLine) + '</small>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function setupGlobalSearch() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = page.querySelector("[data-global-search-input]");
    var results = page.querySelector("[data-global-search-results]");

    if (!input || !results) {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var source = window.MOVIE_SEARCH_DATA;
      var matched = source.filter(function (movie) {
        if (!query) {
          return true;
        }

        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 72);

      results.innerHTML = matched.map(createSearchCard).join("");
    }

    input.addEventListener("input", render);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();
