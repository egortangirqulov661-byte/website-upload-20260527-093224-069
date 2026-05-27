(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  Array.prototype.slice.call(document.querySelectorAll('.search-panel')).forEach(function (panel) {
    var input = panel.querySelector('.movie-search');
    var root = panel.parentElement;
    var grid = root ? root.querySelector('.searchable-grid') : null;
    var cards = grid ? Array.prototype.slice.call(grid.children) : [];
    var activeFilter = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var okText = !query || haystack.indexOf(query) !== -1;
        var okFilter = activeFilter === 'all' || category === activeFilter;
        card.classList.toggle('is-hidden-card', !(okText && okFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    Array.prototype.slice.call(panel.querySelectorAll('.filter-pill')).forEach(function (button) {
      button.addEventListener('click', function () {
        Array.prototype.slice.call(panel.querySelectorAll('.filter-pill')).forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });
})();
