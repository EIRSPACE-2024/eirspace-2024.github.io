/* ------------------------------------------------------------------------- */
/*   TO PUT AWAY THE NAVBAR WHEN SCROLLING DOWN, AND RETRIEVE IT WHEN S UP   */
/* ------------------------------------------------------------------------- */

let lastScrollTop = 0;
let lastClick = 0;
const navbar = document.getElementById('navbar');
const dropdownLinks = document.querySelector('.dropdown-links');
const menuToggle = document.querySelector('.menu-toggle');

/* ------------------------------------------------------------------------- */

if (navbar && dropdownLinks && menuToggle) {
    window.addEventListener('click', () => {
        if (lastClick == 0) {
            lastClick += 1;
            return;
        }

        if (dropdownLinks.classList.contains('active')) {
            lastClick = 0;
            closeMenu();
        }
    });

    dropdownLinks.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

/* ------------------------------------------------------------------------- */

if (navbar && dropdownLinks && menuToggle) {
    window.addEventListener('scroll', () => {
        // Close the possible drop down menu.
        if (dropdownLinks.classList.contains('active')) {
            lastClick = 0;
            closeMenu();
        }

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
}

/* ------------------------------------------------------------------------- */
/*                      DROP DOWN MENU ANIMATION                             */
/* ------------------------------------------------------------------------- */

function toggleMenu() {
    if (!dropdownLinks || !menuToggle) {
        return;
    }

    if (dropdownLinks.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    if (!dropdownLinks || !menuToggle) {
        return;
    }

    dropdownLinks.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
}

function closeMenu() {
    if (!dropdownLinks || !menuToggle) {
        return;
    }

    dropdownLinks.classList.add('closing');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    
    setTimeout(() => {
        dropdownLinks.classList.remove('active', 'closing');
    }, 200);
}

if (dropdownLinks) {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dropdownLinks.classList.contains('active')) {
            closeMenu();
        }
    });
}

/* ------------------------------------------------------------------------- */

