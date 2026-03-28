/* ------------------------------------------------------------------------- */
/*   TO PUT AWAY THE NAVBAR WHEN SCROLLING DOWN, AND RETRIEVE IT WHEN S UP   */
/* ------------------------------------------------------------------------- */

let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
let ticking = false;
const KEEP_VISIBLE_TOP_OFFSET = 24;
const navbar = document.getElementById('navbar');
const dropdownLinks = document.querySelector('.dropdown-links');
const menuToggle = document.querySelector('.menu-toggle');

if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () => {
        toggleMenu();
    });
}

markCurrentPageActive();

/* ------------------------------------------------------------------------- */

window.addEventListener('click', (event) => {
    if (!dropdownLinks) {
        return;
    }

    const clickedInsideMenu = dropdownLinks.contains(event.target);
    const clickedToggle = menuToggle && menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle && dropdownLinks.classList.contains('active')) {
        closeMenu();
    }
});

/* ------------------------------------------------------------------------- */

window.addEventListener('scroll', () => {
    if (!navbar) {
        return;
    }

    if (ticking) {
        return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
        handleNavbarOnScroll();
        ticking = false;
    });
}, { passive: true });

/* ------------------------------------------------------------------------- */

function handleNavbarOnScroll() {
    if (!navbar) {
        return;
    }

    // Close the possible drop down menu.
    if (dropdownLinks && dropdownLinks.classList.contains('active')) {
        closeMenu();
    }

    const st = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Keep navbar always available.
    navbar.classList.remove('navbar-hidden');

    lastScrollTop = st <= 0 ? 0 : st;
}

/* ------------------------------------------------------------------------- */
/*                      DROP DOWN MENU ANIMATION                             */
/* ------------------------------------------------------------------------- */

function toggleMenu() {
    if (!dropdownLinks) {
        return;
    }

    if (dropdownLinks.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    if (!dropdownLinks) {
        return;
    }

    dropdownLinks.classList.add('active');
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'true');
    }
}

function closeMenu() {
    if (!dropdownLinks) {
        return;
    }

    if (!dropdownLinks.classList.contains('active')) {
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        return;
    }

    dropdownLinks.classList.add('closing');
    
    setTimeout(() => {
        dropdownLinks.classList.remove('active', 'closing');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }, 200);
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdownLinks && dropdownLinks.classList.contains('active')) {
        closeMenu();
    }
});

function markCurrentPageActive() {
    const normalizePath = (value) => (value || '').replace(/\/+$/, '');
    const currentPath = normalizePath(window.location.pathname);
    const allNavLinks = document.querySelectorAll('.nav-links a, .dropdown-links a');

    allNavLinks.forEach((link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('http')) {
            return;
        }

        let targetPath = '';
        try {
            targetPath = normalizePath(new URL(rawHref, window.location.origin + '/').pathname);
        } catch (error) {
            return;
        }

        if (targetPath === currentPath) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/* ------------------------------------------------------------------------- */

