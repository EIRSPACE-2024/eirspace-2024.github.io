/* ------------------------------------------------------------------------- */
/*                              TO RETRIEVE A TEXT                           */
/* ------------------------------------------------------------------------- */

const text = "Bienvenue sur Eirspace, explorez les mystères de l'univers.";


/* ------------------------------------------------------------------------- */
/*                              TO TYPE A TEXT                               */
/* ------------------------------------------------------------------------- */

const typingSpeed = text.length / 2; 

/* ------------------------------------------------------------------------- */

function typeEffect(element, cursorElement, text, speed) {
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            cursorElement.style.display = 'inline';
            setTimeout(() => {
                cursorElement.style.display = 'none';
                setTimeout(type, speed);
            }, speed / 2);
        } else {
            cursorElement.style.display = 'none';
        }
    }

    type();
}

/* ------------------------------------------------------------------------- */
/*                              ON THE WEB PAGE                              */
/* ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const targetElement = document.getElementById("typing-text");
    const cursorElement = document.getElementById("cursor");
    typeEffect(targetElement, cursorElement, text, typingSpeed);
});

/* ------------------------------------------------------------------------- */

