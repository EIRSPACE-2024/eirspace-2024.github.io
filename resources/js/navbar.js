/* ------------------------------------------------------------------------- */
/*   TO PUT AWAY THE NAVBAR WHEN SCROLLING DOWN, AND RETRIEVE IT WHEN S UP   */
/* ------------------------------------------------------------------------- */

let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
let ticking = false;
const KEEP_VISIBLE_TOP_OFFSET = 24;
const navbar = document.getElementById('navbar');
const dropdownLinks = document.querySelector('.dropdown-links');
const menuToggle = document.querySelector('.menu-toggle');
let closeMenuTimer = null;

if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () => {
        toggleMenu();
    });
}

markCurrentPageActive();
updateAriaVisibility();
updateFooterYear();

window.addEventListener('resize', updateAriaVisibility, { passive: true });

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

    if (closeMenuTimer) {
        window.clearTimeout(closeMenuTimer);
        closeMenuTimer = null;
    }

    if (!dropdownLinks.classList.contains('active')) {
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        return;
    }

    dropdownLinks.classList.add('closing');
    
    closeMenuTimer = window.setTimeout(() => {
        dropdownLinks.classList.remove('active', 'closing');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        closeMenuTimer = null;
    }, 200);
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdownLinks && dropdownLinks.classList.contains('active')) {
        closeMenu();
    }
});

function markCurrentPageActive() {
    let currentFile = window.location.pathname.split('/').pop();
    if (!currentFile || currentFile === '/') {
        currentFile = 'index.html';
    }

    const allNavLinks = document.querySelectorAll('.nav-links a, .dropdown-links a');

    allNavLinks.forEach((link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('http')) {
            return;
        }

        let targetFile = rawHref.split('/').pop();
        if (!targetFile || targetFile === '.') {
            targetFile = 'index.html';
        }

        if (targetFile === currentFile) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function updateAriaVisibility() {
    const isMobile = window.innerWidth <= 1200;
    const navLinks = document.querySelector('.nav-links');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (navLinks) {
        navLinks.setAttribute('aria-hidden', isMobile ? 'true' : 'false');
    }

    if (dropdownMenu) {
        dropdownMenu.setAttribute('aria-hidden', isMobile ? 'false' : 'true');
    }
}

function updateFooterYear() {
    const year = String(new Date().getFullYear());
    const yearNodes = document.querySelectorAll('#footer-year');
    yearNodes.forEach((node) => {
        node.textContent = year;
    });
}

/* ------------------------------------------------------------------------- */

