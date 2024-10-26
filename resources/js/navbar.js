/* ------------------------------------------------------------------------- */
/*   TO PUT AWAY THE NAVBAR WHEN SCROLLING DOWN, AND RETRIEVE IT WHEN S UP   */
/* ------------------------------------------------------------------------- */

let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

/* ------------------------------------------------------------------------- */

window.addEventListener('scroll', () => {
    let st = window.pageYOffset || document.documentElement.scrollTop;

    if (st > lastScrollTop) {
        // Bottom.
        navbar.style.transform = 'translateY(-140%)';
    } else {
        // Upper.
        navbar.style.transform = 'translateY(0)';
    }
    lastScrollTop = st <= 0 ? 0 : st;
});

/* ------------------------------------------------------------------------- */

