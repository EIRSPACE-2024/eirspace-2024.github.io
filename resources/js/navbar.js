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
/*                      DROP DOWN MENU ANIMATION                             */
/* ------------------------------------------------------------------------- */

function toggleMenu() {
    const dropdownLinks = document.querySelector('.dropdown-links');
    
    if (dropdownLinks.classList.contains('active')) {
        // Closing it smoothly.
        dropdownLinks.classList.add('closing');
        
        setTimeout(() => {
            dropdownLinks.classList.remove('active', 'closing');
        }, 500);
    } else {
        dropdownLinks.classList.add('active');
    }
}

/* ------------------------------------------------------------------------- */

