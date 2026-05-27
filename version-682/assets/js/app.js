function ready(run) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
}

function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = "./search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });
}

function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
        return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    var current = 0;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
        });
    });
    window.setInterval(function () {
        show(current + 1);
    }, 5200);
}

function cardMatches(card, keyword, typeValue, yearValue) {
    var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.textContent
    ].join(" ").toLowerCase();
    var type = (card.getAttribute("data-type") || "").toLowerCase();
    var year = (card.getAttribute("data-year") || "").toLowerCase();
    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
    var okType = !typeValue || type.indexOf(typeValue) !== -1;
    var okYear = !yearValue || year === yearValue;
    return okKeyword && okType && okYear;
}

function initFilters() {
    var input = document.querySelector(".filter-input");
    var typeSelect = document.querySelector(".filter-select");
    var yearSelect = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    if (!cards.length || (!input && !typeSelect && !yearSelect)) {
        return;
    }
    function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : "";
        var yearValue = yearSelect ? yearSelect.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
            card.classList.toggle("is-hidden", !cardMatches(card, keyword, typeValue, yearValue));
        });
    }
    [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        }
    });
}

function renderSearchResults() {
    var box = document.querySelector("[data-search-results]");
    if (!box || !window.movieIndex) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var normalized = query.toLowerCase();
    var formInput = document.querySelector(".search-page-form input[name='q']");
    if (formInput) {
        formInput.value = query;
    }
    var matches = window.movieIndex.filter(function (item) {
        if (!normalized) {
            return true;
        }
        var text = [item.title, item.region, item.type, item.year, item.genre, item.line, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(normalized) !== -1;
    }).slice(0, 180);
    box.innerHTML = matches.map(function (item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h2 class=\"movie-title\"><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
            "<p class=\"movie-line\">" + escapeHtml(item.line) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }).join("");
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initPlayers() {
    document.querySelectorAll("[data-stream]").forEach(function (box) {
        var streamUrl = box.getAttribute("data-stream");
        var video = box.querySelector("video");
        var overlay = box.querySelector(".player-overlay");
        if (!streamUrl || !video || !overlay) {
            return;
        }
        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.getAttribute("src") !== streamUrl) {
                    video.setAttribute("src", streamUrl);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!video.hlsPlayer) {
                    var hlsPlayer = new window.Hls();
                    hlsPlayer.loadSource(streamUrl);
                    hlsPlayer.attachMedia(video);
                    video.hlsPlayer = hlsPlayer;
                }
            } else if (video.getAttribute("src") !== streamUrl) {
                video.setAttribute("src", streamUrl);
            }
        }
        function start() {
            overlay.classList.add("is-hidden");
            attach();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    });
}

ready(function () {
    initMobileMenu();
    initSearchForms();
    initHeroCarousel();
    initFilters();
    renderSearchResults();
    initPlayers();
});
