(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        var keywordInput = filterForm.querySelector('[data-filter-keyword]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var applyFilter = function () {
            var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            var year = yearSelect && yearSelect.value || '';
            var type = typeSelect && typeSelect.value || '';
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                var okType = !type || card.getAttribute('data-type') === type;
                card.style.display = okKeyword && okYear && okType ? '' : 'none';
            });
        };
        filterForm.addEventListener('input', applyFilter);
        filterForm.addEventListener('change', applyFilter);
    }
}());
