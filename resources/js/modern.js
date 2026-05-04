/* =================================================================
   EIRSPACE — Modern Interactions v2
   - Smooth scroll (Lenis-like): interpolated scroll for buttery feel
   - Intersection-based scroll reveals
   - Lightbox for astro gallery
   - Back-to-top button
   - Force visibility on cards (defensive against bundle's reveal CSS)
   ================================================================= */

(function () {
    'use strict';

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =============================================================
       SMOOTH SCROLL (Lenis-style) — interpolated wheel-driven scroll
       Lightweight implementation: catches wheel events, interpolates
       toward target scroll position with easing.
       ============================================================= */
    function initSmoothScroll() {
        if (prefersReduced) return;

        // Disable on mobile (touch scroll is already smooth via inertia)
        var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouch && window.innerWidth < 1024) return;

        var current = window.scrollY;
        var target  = window.scrollY;
        var ease    = 0.085;       // Lower = smoother but laggier
        var speed   = 1.0;         // Wheel multiplier
        var rafId   = null;
        var running = false;

        function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

        function update() {
            current += (target - current) * ease;
            // Stop the loop once close enough to avoid wasting cpu
            if (Math.abs(target - current) < 0.4) {
                current = target;
                window.scrollTo(0, current);
                running = false;
                rafId = null;
                return;
            }
            window.scrollTo(0, current);
            rafId = requestAnimationFrame(update);
        }

        function ensureLoop() {
            if (!running) {
                running = true;
                rafId = requestAnimationFrame(update);
            }
        }

        // Hook the wheel event
        window.addEventListener('wheel', function (e) {
            // Let the browser handle ctrl+wheel (zoom)
            if (e.ctrlKey) return;
            // Don't intercept if scrolling inside a scrollable element
            var el = e.target;
            while (el && el !== document.body) {
                var style = getComputedStyle(el);
                if ((el.scrollHeight > el.clientHeight) &&
                    (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
                    return; // let inner element scroll naturally
                }
                el = el.parentElement;
            }

            e.preventDefault();
            target = clamp(target + e.deltaY * speed, 0, document.documentElement.scrollHeight - window.innerHeight);
            ensureLoop();
        }, { passive: false });

        // Sync on user direct manipulation (e.g., scrollbar drag, anchor jump)
        window.addEventListener('scroll', function () {
            // If scroll is from outside our loop (no animation running), sync target
            if (!running) {
                current = window.scrollY;
                target  = window.scrollY;
            }
        }, { passive: true });

        // Sync on resize
        window.addEventListener('resize', function () {
            target  = clamp(target,  0, document.documentElement.scrollHeight - window.innerHeight);
            current = clamp(current, 0, document.documentElement.scrollHeight - window.innerHeight);
        });

        // Smooth anchor scroll
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a[href^="#"]');
            if (!a) return;
            var hash = a.getAttribute('href');
            if (hash.length < 2) return;
            var dest = document.querySelector(hash);
            if (!dest) return;
            e.preventDefault();
            target = clamp(dest.getBoundingClientRect().top + window.scrollY, 0,
                           document.documentElement.scrollHeight - window.innerHeight);
            ensureLoop();
        });

        // Expose for back-to-top
        window.eirspaceSmoothScrollTo = function (y) {
            target = clamp(y, 0, document.documentElement.scrollHeight - window.innerHeight);
            ensureLoop();
        };
    }

    /* =============================================================
       SCROLL REVEAL
       ============================================================= */
    function initReveal() {
        var els = document.querySelectorAll('.reveal');
        if (!els.length) return;

        if (!('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

        els.forEach(function (el) { io.observe(el); });
    }

    /* =============================================================
       FORCE VISIBLE — defensive cleanup
       Some bundle.css rules add image-reveal-pending / box-reveal-pending
       which hide images via transform: scale(0.04). Strip these on cards
       that should be visible immediately.
       ============================================================= */
    function forceVisible() {
        var selectors = [
            '.team-modern-card',
            '.team-modern-card img',
            '.partner-card',
            '.partner-card img',
            '.partner-logo',
            '.partner-card .partner-logo-wrap',
            '.astro-card',
            '.astro-card img',
            '.timeline-card img',
            '.partnership-cta-card',
            '.partnership-cta-card img',
            '.team-section .team-member',
            '.team-section .team-member img',
            '.team-section .team-member-juju',
            '.team-section .team-member-juju img'
        ];
        var els = document.querySelectorAll(selectors.join(','));
        els.forEach(function (el) {
            el.classList.remove('image-reveal-pending');
            el.classList.remove('box-reveal-pending');
            el.classList.add('image-reveal-loaded');
            el.classList.add('box-reveal-loaded');
            el.dataset.revealReady = 'true';
        });
    }

    /* =============================================================
       LIGHTBOX (astro pictures)
       ============================================================= */
    function initLightbox() {
        var triggers = document.querySelectorAll('[data-lightbox]');
        if (!triggers.length) return;

        var lb = document.getElementById('eirspace-lightbox');
        if (!lb) {
            lb = document.createElement('div');
            lb.id = 'eirspace-lightbox';
            lb.className = 'lightbox';
            lb.setAttribute('role', 'dialog');
            lb.setAttribute('aria-modal', 'true');
            lb.setAttribute('aria-label', 'Galerie photo');
            lb.innerHTML =
                '<button class="lightbox-close" aria-label="Fermer">&times;</button>' +
                '<img alt="" />' +
                '<div class="lightbox-caption"></div>';
            document.body.appendChild(lb);
        }

        var img = lb.querySelector('img');
        var cap = lb.querySelector('.lightbox-caption');
        var closeBtn = lb.querySelector('.lightbox-close');

        function open(src, alt, caption) {
            img.src = src;
            img.alt = alt || '';
            cap.textContent = caption || '';
            lb.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            lb.classList.remove('is-open');
            document.body.style.overflow = '';
            img.src = '';
        }

        triggers.forEach(function (t) {
            t.addEventListener('click', function (e) {
                e.preventDefault();
                var src = t.getAttribute('data-lightbox');
                var alt = t.getAttribute('data-alt') || '';
                var caption = t.getAttribute('data-caption') || '';
                if (src && src !== '#') open(src, alt, caption);
            });
        });

        closeBtn.addEventListener('click', close);
        lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
        });
    }

    /* =============================================================
       BACK TO TOP
       ============================================================= */
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'back-to-top';
            btn.className = 'back-to-top';
            btn.setAttribute('aria-label', 'Retour en haut de la page');
            btn.innerHTML = '↑';
            document.body.appendChild(btn);
        }

        function onScroll() {
            if (window.scrollY > 600) btn.classList.add('is-visible');
            else btn.classList.remove('is-visible');
        }

        btn.addEventListener('click', function () {
            if (window.eirspaceSmoothScrollTo) {
                window.eirspaceSmoothScrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* =============================================================
       NEUTRALIZE PAGE-LEAVE delay (240ms perdu à chaque clic interne)
       ============================================================= */
    function neutralizePageLeave() {
        // The bundle's loading.js adds .page-leave on link clicks for a fade.
        // We don't want that — too slow for a multi-page site. Strip it.
        var observer = new MutationObserver(function () {
            if (document.body.classList.contains('page-leave')) {
                document.body.classList.remove('page-leave');
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    /* =============================================================
       INIT
       ============================================================= */
    function init() {
        forceVisible();              // run early
        initSmoothScroll();
        initReveal();
        initLightbox();
        initBackToTop();
        neutralizePageLeave();

        // Re-run forceVisible periodically for safety (in case bundle JS
        // re-applies pending classes on dynamic content)
        setTimeout(forceVisible, 200);
        setTimeout(forceVisible, 800);
        setTimeout(forceVisible, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
