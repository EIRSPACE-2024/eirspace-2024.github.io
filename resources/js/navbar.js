/* ------------------------------------------------------------------------- */
/*   TO PUT AWAY THE NAVBAR WHEN SCROLLING DOWN, AND RETRIEVE IT WHEN S UP   */
/* ------------------------------------------------------------------------- */

let lastScrollTop = 0;
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

    // Close the possible drop down menu.
    if (dropdownLinks && dropdownLinks.classList.contains('active')) {
        closeMenu();
    }

    let st = window.pageYOffset || document.documentElement.scrollTop;

    if (document.body.classList.contains('page-exit')) {
        navbar.style.transform = 'translateY(0)';
        return;
    }

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

