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

const shootingStarTimer = setInterval(createShootingStar, 6000);

window.addEventListener('pagehide', () => {
    clearInterval(shootingStarTimer);
});

/* ------------------------------------------------------------------------- */

