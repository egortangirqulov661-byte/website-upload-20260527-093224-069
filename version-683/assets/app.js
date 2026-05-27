(function () {
  var nav = document.querySelector('.nav-links');
  var toggle = document.querySelector('.mobile-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === slideIndex);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  searchInputs.forEach(function (input) {
    var targetSelector = input.getAttribute('data-search-input');
    var scope = targetSelector ? document.querySelector(targetSelector) : document;
    var empty = document.querySelector('[data-empty-state]');
    if (!scope) {
      scope = document;
    }
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-text'));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    });
  });
})();
