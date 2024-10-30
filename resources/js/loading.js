/* ------------------------------------------------------------------------- */
/*                      TO GENERATE A STAR FIELD                             */
/* ------------------------------------------------------------------------- */

const starField = document.querySelector('.star-field');
const starDensity = 1 / 15000;

/* ------------------------------------------------------------------------- */
/*                          LOADING SCREEN                                   */
/* ------------------------------------------------------------------------- */

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (!sessionStorage.getItem('hasVisited')) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                sessionStorage.setItem('hasVisited', 'true');
                
                // To wait for the loading to finish.
                generateStarField();
            }, 500); 
        }, 2500); // Max time duration.
    } else {
        loadingScreen.style.display = 'none';
        generateStarField();
    }
});

/* ------------------------------------------------------------------------- */
/*                          PAGE TO PAGE LOADING                             */
/* ------------------------------------------------------------------------- */

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
        if (link.getAttribute('href') !== '#') {
            event.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location = link.getAttribute('href');
            }, 300);
        }
    });
});

/* GO BACK LOADING. */
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
        if (link.getAttribute('href') !== '#') {
            event.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location = link.getAttribute('href');
            }, 300);
        }
    });
});

/* ------------------------------------------------------------------------- */
/*                      TO GENERATE A STAR FIELD                             */
/* ------------------------------------------------------------------------- */

function generateStarField() {
    const starField = document.querySelector('.star-field');
    const starDensity = 1 / 15000;
    const pageWidth = window.innerWidth;
    const pageHeight = document.body.scrollHeight;

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');

        const x = Math.random() * pageWidth;
        const y = Math.random() * pageHeight;

        const size = Math.random() * 6 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        const delay = Math.random() * 3;
        star.style.animationDelay = `${delay}s`;

        starField.appendChild(star);
    }

    adjustStars();

    setTimeout(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.classList.add('twinkling');
        });
    }, 100);

    /* --------------------------------------------------------------------- */
    /*                      WHEN THE WINDOWS RESIZES                         */
    /* --------------------------------------------------------------------- */
    
    function adjustStars() {
        const numStarsNeeded = 
            Math.floor(window.innerWidth * window.innerHeight * starDensity);
        const currentStars = document.querySelectorAll('.star').length;
    
        if (currentStars < numStarsNeeded) {
            for (let i = currentStars; i < numStarsNeeded; i++) {
                createStar();
            }
        } else if (currentStars > numStarsNeeded) {
            for (let i = 0; i < currentStars - numStarsNeeded; i++) {
                const starField = document.querySelector('.star-field');
                starField.removeChild(starField.lastChild);
            }
        }
    }

    /* --------------------------------------------------------------------- */
}

/* ------------------------------------------------------------------------- */

