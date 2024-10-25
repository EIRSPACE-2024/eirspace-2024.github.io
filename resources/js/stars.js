/* ------------------------------------------------------------------------- */
/*                      TO GENERATE A STAR FIELD                             */
/* ------------------------------------------------------------------------- */

const starField = document.querySelector('.star-field');
const starDensity = 1 / 5000;

/* ------------------------------------------------------------------------- */
/*                          SIZE OF THE WINDOW                               */
/* ------------------------------------------------------------------------- */

const pageWidth = window.screen.width;
const pageHeight = document.body.scrollHeight;

/* ------------------------------------------------------------------------- */

function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    const x = Math.random() * pageWidth;
    const y = Math.random() * pageHeight;

    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    const delay = Math.random() * 3;
    star.style.animationDelay = `${delay}s`;

    starField.appendChild(star);

    return star;
}

/* ------------------------------------------------------------------------- */
/*                      WHEN THE WINDOWS RESIZES                             */
/* ------------------------------------------------------------------------- */

function adjustStars() {
    const numStarsNeeded = Math.floor(window.screen.width * window.screen.height * starDensity);
    const currentStars = document.querySelectorAll('.star').length;

    if (currentStars < numStarsNeeded) {
        for (let i = currentStars; i < numStarsNeeded; i++) {
            starField.appendChild(createStar());
        }
    } else if (currentStars > numStarsNeeded) {
        for (let i = 0; i < currentStars - numStarsNeeded; i++) {
            starField.removeChild(starField.lastChild);
        }
    }
}

adjustStars();

/* ------------------------------------------------------------------------- */

setTimeout(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.add('twinkling');
    });
}, 100); // Twinkling starts after 0.1 seconds.

/* ------------------------------------------------------------------------- */

// window.addEventListener('resize', adjustStars);

/* ------------------------------------------------------------------------- */

