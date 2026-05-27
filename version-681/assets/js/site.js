(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var slider = document.querySelector(".js-hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-index") || "0");
        show(next);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFiltering() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".js-movie-list"));
    lists.forEach(function (list) {
      var scope = list.closest("section") || document;
      var input = scope.querySelector(".js-search") || document.querySelector(".js-search");
      var year = scope.querySelector(".js-year") || document.querySelector(".js-year");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll(".js-filter"));
      var empty = scope.querySelector(".js-empty") || document.querySelector(".js-empty");
      var selectedType = "all";
      function apply() {
        var query = normalize(input ? input.value : "");
        var selectedYear = year ? year.value : "all";
        var visible = 0;
        Array.prototype.slice.call(list.querySelectorAll(".js-card")).forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var type = normalize(card.getAttribute("data-type"));
          var cardYear = card.getAttribute("data-year") || "";
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = selectedType === "all" || type.indexOf(normalize(selectedType)) !== -1;
          var matchesYear = selectedYear === "all" || cardYear === selectedYear;
          var matched = matchesQuery && matchesType && matchesYear;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          selectedType = button.getAttribute("data-type") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function initSearchQuery() {
    var input = document.getElementById("global-search");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var value = params.get("q");
    if (value) {
      input.value = value;
      input.dispatchEvent(new Event("input"));
    }
  }

  function initHeroSearch() {
    var form = document.querySelector(".js-hero-search");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      window.location.href = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFiltering();
    initSearchQuery();
    initHeroSearch();
  });
})();
