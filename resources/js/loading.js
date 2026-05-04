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

function shouldEnableStarField() {
    return window.innerWidth >= 768;
}

function initImageReveal() {
    if (prefersReducedMotionEnabled()) {
        return;
    }

    const revealTargets = document.querySelectorAll(
        '.section-member img, .team-member img, .minipage-member img, .partner-logo'
    );

    function getRevealBoxes(img) {
        const selectors = ['.section-member', '.team-member', '.minipage-member', '.partner-logo-wrap', '.partner-card'];
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
    const transitionDurationMs = 0; // was 240ms — instant nav for fluidity

    // Apply page-enter only if we're not running the loading screen
    if (!window.eirspaceLoadingPlaying) {
        // If the document is already fully loaded, the class addition might cause a flash.
        // We only add it here if we're reasonably early in the cycle, or we just let CSS handle it.
        document.body.classList.add('page-enter');
    }

    if (reducedMotion) {
        return;
    }

    // Page-leave delay disabled for fluidity — links now navigate immediately
    // (we leave the listener structure intact in case we want a fade later)
    return;
}

let pageBootstrapDone = false;

function bootstrapPageAnimations() {
    if (pageBootstrapDone) {
        return;
    }
    
    pageBootstrapDone = true;

    // Remove full-screen intro completely to avoid replay/visibility issues.
    if (!window.eirspaceLoadingPlaying) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    initPageTransitions();
    scheduleImageRevealInitialization();
    scheduleStarFieldInitialization();
}

function scheduleImageRevealInitialization() {
    const startImageReveal = () => {
        if (document.hidden) {
            return;
        }

        initImageReveal();
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startImageReveal, { timeout: 900 });
        return;
    }

    window.setTimeout(startImageReveal, 150);
}

function scheduleStarFieldInitialization() {
    const startStarField = () => {
        if (document.hidden || !shouldEnableStarField()) {
            return;
        }

        generateStarField();
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startStarField, { timeout: 1200 });
        return;
    }

    window.setTimeout(startStarField, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPageAnimations, { once: true });
} else {
    bootstrapPageAnimations();
}

// Fallback in case DOMContentLoaded listener is skipped in edge navigation cases.
window.addEventListener('load', bootstrapPageAnimations, { once: true });

/* ------------------------------------------------------------------------- */
/*                      TO GENERATE A STAR FIELD                             */
/* ------------------------------------------------------------------------- */

function generateStarField() {
    const starField = document.querySelector('.star-field');
    if (!starField) {
        return;
    }

    if (!shouldEnableStarField()) {
        starField.innerHTML = '';
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
    let lastPageHeight = pageHeight;

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

        if (currentStars === numStarsNeeded && Math.abs(lastPageHeight - pageHeight) < 50) {
            return;
        }

        if (Math.abs(lastPageHeight - pageHeight) >= 50) {
            starField.innerHTML = '';
            lastPageHeight = pageHeight;
        }

        const actualCurrentStars = document.querySelectorAll('.star').length;
        const fragment = document.createDocumentFragment();
    
        if (actualCurrentStars < numStarsNeeded) {
            for (let i = actualCurrentStars; i < numStarsNeeded; i++) {
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
        } else if (actualCurrentStars > numStarsNeeded) {
            for (let i = 0; i < actualCurrentStars - numStarsNeeded; i++) {
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

    window.addEventListener('pageshow', (event) => {
        adjustStars();
    });
    window.addEventListener('load', adjustStars); // Re-calculate stars when images finish loading

    /* --------------------------------------------------------------------- */
}

/* ------------------------------------------------------------------------- */

