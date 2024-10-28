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
            }, 500); 
        }, 2500); // Max time duration.
    } else {
        loadingScreen.style.display = 'none';
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

