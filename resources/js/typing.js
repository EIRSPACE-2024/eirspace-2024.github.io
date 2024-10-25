/* ------------------------------------------------------------------------- */
/*                              TO TYPE A TEXT                               */
/* ------------------------------------------------------------------------- */

function typeEffect(element, cursorElement, text, speed) {
    let i = 0;

    function type() {
        if (i < text.length) {
            if (text.charAt(i) == '<') {
                // EOL.
                element.innerHTML += '<BR>';
                i += 4;

                cursorElement.innerHTML = "<BR>";
            } else {
                element.innerHTML += text.charAt(i);
                i++;
                cursorElement.style.display = 'inline';
            }

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


function typeWebPage(typingTextId, cursorId, typingSpeed) {
    const targetElement = document.getElementById(typingTextId);
    const cursorElement = document.getElementById(cursorId);
    const text = targetElement.getAttribute("data-text")

    typeEffect(targetElement, cursorElement, text, typingSpeed);
}

/* ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    typeWebPage("typing-text_index_section_1", "cursor_index_section_1", 30);
});

/* ------------------------------------------------------------------------- */

