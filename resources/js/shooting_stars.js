/* ------------------------------------------------------------------------- */
/*                              SHOOTING STAR                                */
/* ------------------------------------------------------------------------- */


function createShootingStar() {
    const starContainer = document.querySelector('.shooting-star-field');
    if (!starContainer) {
        return;
    }

    const star = document.createElement('div');
    star.classList.add('shooting-star');

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight / 2);

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    starContainer.appendChild(star);

    setTimeout(() => {
        if (star.parentNode === starContainer) {
            starContainer.removeChild(star);
        }
    }, 2000); // CSS Animation stops after 2s.
}

const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveDataEnabled =
    navigator.connection && navigator.connection.saveData;

const SHOOTING_STAR_PERIOD_MS = 6000;
const ANIMATION_SESSION_START_KEY = 'eirspace-animation-session-start';

let shootingStarInterval = null;
let shootingStarTimeout = null;

function getAnimationSessionStart() {
    try {
        const rawValue = window.sessionStorage.getItem(ANIMATION_SESSION_START_KEY);
        const parsedValue = Number(rawValue);
        if (Number.isFinite(parsedValue) && parsedValue > 0) {
            return parsedValue;
        }
    } catch (error) {
        // Ignore storage failures and fallback to now.
    }

    const now = Date.now();
    try {
        window.sessionStorage.setItem(ANIMATION_SESSION_START_KEY, String(now));
    } catch (error) {
        // Ignore storage failures.
    }

    return now;
}

function getDelayUntilNextShootingStar() {
    const sessionStart = getAnimationSessionStart();
    const elapsedInPeriod = (Date.now() - sessionStart) % SHOOTING_STAR_PERIOD_MS;
    const remainingMs = SHOOTING_STAR_PERIOD_MS - elapsedInPeriod;
    return remainingMs === SHOOTING_STAR_PERIOD_MS ? 0 : remainingMs;
}

function startShootingStars() {
    if (shootingStarInterval || shootingStarTimeout || document.hidden || prefersReducedMotion || saveDataEnabled) {
        return;
    }

    const delay = getDelayUntilNextShootingStar();
    shootingStarTimeout = window.setTimeout(() => {
        shootingStarTimeout = null;
        createShootingStar();
        shootingStarInterval = window.setInterval(createShootingStar, SHOOTING_STAR_PERIOD_MS);
    }, delay);
}

function stopShootingStars() {
    if (shootingStarTimeout) {
        window.clearTimeout(shootingStarTimeout);
        shootingStarTimeout = null;
    }

    if (shootingStarInterval) {
        window.clearInterval(shootingStarInterval);
        shootingStarInterval = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopShootingStars();
    } else {
        startShootingStars();
    }
});

startShootingStars();

window.addEventListener('pagehide', () => {
    stopShootingStars();
});

/* ------------------------------------------------------------------------- */

