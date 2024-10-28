/* ------------------------------------------------------------------------- */
/*                              TO TYPE A TEXT                               */
/* ------------------------------------------------------------------------- */

function typeEffect(element, text, speed) {
    let i = 0;

    function type() {
        if (i < text.length) {
            if (text.charAt(i) == '<') {
                // EOL.
                element.innerHTML += '<BR>';
                i += 4;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }

            setTimeout(() => {
                setTimeout(type, speed);
            }, speed / 2);
        }
    }

    type();
}

/* ------------------------------------------------------------------------- */
/*                              ON THE WEB PAGE                              */
/* ------------------------------------------------------------------------- */


function typeWebPage(typingTextId, typingSpeed) {
    const targetElement = document.getElementById(typingTextId);
    const text = targetElement.getAttribute("data-text")

    typeEffect(targetElement, text, typingSpeed);
}

/* ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    typeWebPage("typing-text_0", 40);
});

/* ------------------------------------------------------------------------- */

