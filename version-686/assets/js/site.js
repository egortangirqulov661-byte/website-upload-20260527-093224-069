(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('active', currentIndex === activeIndex);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('active', currentIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const noResults = document.querySelector('[data-no-results]');
  let filterValue = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    const keyword = normalize(searchInput ? searchInput.value : '');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedFilter = !filterValue || haystack.includes(normalize(filterValue));
      const visible = matchedKeyword && matchedFilter;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', applyFilter);
  }

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      filterValue = button.dataset.filterValue || '';
      document.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });
})();
