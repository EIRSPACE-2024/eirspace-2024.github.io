/* ------------------------------------------------------------------------- */
/*                          LOADING SCREEN                                   */
/* ------------------------------------------------------------------------- */

function getLocalFlag(key) {
    try {
        if (window.localStorage.getItem(key) === 'true') {
            return true;
        }
    } catch (error) {
        // Continue to fallback storages.
    }

    try {
        if (window.sessionStorage.getItem(key) === 'true') {
            return true;
        }
    } catch (error) {
        // Continue to cookie fallback.
    }

    try {
        return document.cookie.split('; ').some((entry) => entry === `${key}=true`);
    } catch (error) {
        return false;
    }
}

function setLocalFlag(key) {
    try {
        window.localStorage.setItem(key, 'true');
    } catch (error) {
        // Ignore and keep fallback storages.
    }

    try {
        window.sessionStorage.setItem(key, 'true');
    } catch (error) {
        // Ignore and keep cookie fallback.
    }

    try {
        document.cookie = `${key}=true; path=/; max-age=31536000; samesite=lax`;
    } catch (error) {
        // Ignore cookie errors.
    }
}

function getSessionNumber(key) {
    try {
        const rawValue = window.sessionStorage.getItem(key);
        if (!rawValue) {
            return null;
        }

        const parsedValue = Number(rawValue);
        return Number.isFinite(parsedValue) ? parsedValue : null;
    } catch (error) {
        return null;
    }
}

function setSessionNumber(key, value) {
    try {
        window.sessionStorage.setItem(key, String(value));
    } catch (error) {
        // Ignore storage write failures.
    }
}

function ensureAnimationSessionStart() {
    const key = 'eirspace-animation-session-start';
    const existingValue = getSessionNumber(key);
    if (existingValue !== null) {
        return existingValue;
    }

    const now = Date.now();
    setSessionNumber(key, now);
    return now;
}

function ensureAnimationSeed() {
    const key = 'eirspace-animation-seed';
    const existingValue = getSessionNumber(key);
    if (existingValue !== null) {
        return existingValue;
    }

    const generatedSeed = Math.floor(Math.random() * 2147483647) + 1;
    setSessionNumber(key, generatedSeed);
    return generatedSeed;
}

function createSeededRandom(initialSeed) {
    let seed = (initialSeed >>> 0) || 1;

    return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

function isIndexPage() {
    const pathname = window.location.pathname.toLowerCase();
    return pathname === '/' || pathname.endsWith('/index.html');
}

function prefersReducedMotionEnabled() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initImageReveal() {
    if (prefersReducedMotionEnabled()) {
        return;
    }

    const revealTargets = document.querySelectorAll(
        '.section-member img, .team-member img, .team-member-juju img, .minipage-member img, .partner-logo'
    );

    function getRevealBoxes(img) {
        const selectors = ['.section-member', '.team-member', '.team-member-juju', '.minipage-member', '.partner-logo-wrap', '.partner-card'];
        const boxes = [];

        selectors.forEach((selector) => {
            const box = img.closest(selector);
            if (box && !boxes.includes(box)) {
                boxes.push(box);
            }
        });

        return boxes;
    }

    revealTargets.forEach((img) => {
        if (img.dataset.revealReady === 'true') {
            return;
        }

        const revealBoxes = getRevealBoxes(img);

        img.classList.add('image-reveal-pending');
        revealBoxes.forEach((box) => {
            if (box.dataset.revealReady !== 'true') {
                box.classList.add('box-reveal-pending');
            }
        });

        const reveal = () => {
            if (img.dataset.revealReady === 'true') {
                return;
            }

            img.dataset.revealReady = 'true';
            img.classList.remove('image-reveal-pending');
            img.classList.add('image-reveal-loaded');

            revealBoxes.forEach((box) => {
                if (box.dataset.revealReady !== 'true') {
                    box.dataset.revealReady = 'true';
                    box.classList.remove('box-reveal-pending');
                    box.classList.add('box-reveal-loaded');
                }
            });
        };

        const stopReveal = () => {
            img.dataset.revealReady = 'true';
            img.classList.remove('image-reveal-pending');
            img.classList.remove('image-reveal-loaded');

            revealBoxes.forEach((box) => {
                if (box.dataset.revealReady !== 'true') {
                    box.dataset.revealReady = 'true';
                    box.classList.remove('box-reveal-pending');
                    box.classList.remove('box-reveal-loaded');
                }
            });
        };

        if (img.complete && img.naturalWidth > 0) {
            window.requestAnimationFrame(reveal);
            return;
        }

        img.addEventListener('load', reveal, { once: true });
        img.addEventListener('error', stopReveal, { once: true });
    });
}

function initPageTransitions() {
    const reducedMotion = prefersReducedMotionEnabled();
    const transitionDurationMs = 240;

    document.body.classList.add('page-enter');

    if (reducedMotion) {
        return;
    }

    let isNavigating = false;

    document.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (isNavigating) {
                return;
            }

            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                return;
            }

            const href = link.getAttribute('href');
            if (!href || href === '#' || link.target === '_blank') {
                return;
            }

            if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
                return;
            }

            const nextUrl = new URL(href, window.location.href);
            if (nextUrl.origin !== window.location.origin || nextUrl.href === window.location.href) {
                return;
            }

            event.preventDefault();
            isNavigating = true;
            document.body.classList.add('page-leave');

            window.setTimeout(() => {
                window.location.href = nextUrl.href;
            }, transitionDurationMs);
        });
    });
}

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const FIRST_VISIT_KEY = 'eirspace-first-visit-done';

    if (!loadingScreen) {
        generateStarField();
        initImageReveal();
        initPageTransitions();
        return;
    }

    const isLandingOnIndex = isIndexPage();
    const isFirstVisit = !getLocalFlag(FIRST_VISIT_KEY);

    // Intro is allowed only once and only on index page.
    if (isLandingOnIndex && isFirstVisit) {
        // Mark immediately so fast navigation cannot replay the intro on next page.
        setLocalFlag(FIRST_VISIT_KEY);

        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // To wait for the loading to finish.
                generateStarField();
                initImageReveal();
                initPageTransitions();
            }, 500); 
        }, 2500); // Max time duration.
    } else {
        if (isFirstVisit) {
            // Consume first visit even when entering from another page.
            setLocalFlag(FIRST_VISIT_KEY);
        }

        loadingScreen.style.display = 'none';
        generateStarField();
        initImageReveal();
        initPageTransitions();
    }
});

/* ------------------------------------------------------------------------- */
/*                      TO GENERATE A STAR FIELD                             */
/* ------------------------------------------------------------------------- */

function generateStarField() {
    const starField = document.querySelector('.star-field');
    if (!starField) {
        return;
    }

    const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveDataEnabled =
        navigator.connection && navigator.connection.saveData;

    if (prefersReducedMotion || saveDataEnabled) {
        starField.innerHTML = '';
        return;
    }

    const animationSessionStart = ensureAnimationSessionStart();
    const animationSeed = ensureAnimationSeed();
    const twinkleDuration = 4;

    const starDensity = 1 / 10000;
    let pageWidth = window.innerWidth;
    let pageHeight = Math.max(document.body.scrollHeight, window.innerHeight);

    function refreshDimensions() {
        pageWidth = window.innerWidth;
        pageHeight = Math.max(document.body.scrollHeight, window.innerHeight);
    }

    adjustStars();

    /* --------------------------------------------------------------------- */
    /*                      WHEN THE WINDOWS RESIZES                         */
    /* --------------------------------------------------------------------- */
    
    function adjustStars() {
        refreshDimensions();
        const numStarsNeeded = 
            Math.min(280, Math.floor(window.innerWidth * window.innerHeight * starDensity));
        const currentStars = document.querySelectorAll('.star').length;

        if (currentStars === numStarsNeeded) {
            return;
        }

        const fragment = document.createDocumentFragment();
    
        if (currentStars < numStarsNeeded) {
            for (let i = currentStars; i < numStarsNeeded; i++) {
                const star = document.createElement('div');
                star.classList.add('star');

                const random = createSeededRandom(animationSeed + i * 2654435761);

                const x = random() * pageWidth;
                const y = random() * pageHeight;

                const size = random() * 6 + 1;
                const phaseOffset = random() * twinkleDuration;
                const elapsedSeconds = (Date.now() - animationSessionStart) / 1000;
                const animationOffset = elapsedSeconds + phaseOffset;

                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${x}px`;
                star.style.top = `${y}px`;
                star.style.animationDelay = `-${animationOffset.toFixed(3)}s`;
                star.classList.add('twinkling');
                fragment.appendChild(star);
            }

            starField.appendChild(fragment);
        } else if (currentStars > numStarsNeeded) {
            for (let i = 0; i < currentStars - numStarsNeeded; i++) {
                if (starField.lastChild) {
                    starField.removeChild(starField.lastChild);
                }
            }
        }
    }

    let resizeRaf = null;
    window.addEventListener('resize', () => {
        if (resizeRaf) {
            window.cancelAnimationFrame(resizeRaf);
        }

        resizeRaf = window.requestAnimationFrame(() => {
            adjustStars();
            resizeRaf = null;
        });
    });

    window.addEventListener('pageshow', adjustStars);

    /* --------------------------------------------------------------------- */
}

/* ------------------------------------------------------------------------- */

