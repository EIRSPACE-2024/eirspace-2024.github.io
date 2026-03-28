/* ------------------------------------------------------------------------- */
/*                     TYPE TEXT WHEN ELEMENT ENTERS VIEWPORT                */
/* ------------------------------------------------------------------------- */

(function () {
    const DEFAULT_TYPING_SPEED = 40;
    const TYPING_SELECTOR = '[id^="typing-text_"]';
    const TYPING_DONE_KEY = 'eirspace-typing-done';
    const typedElements = new WeakSet();
    let hasStartedFirstTyping = false;

    function getTypingDoneFlag() {
        try {
            return window.localStorage.getItem(TYPING_DONE_KEY) === 'true';
        } catch (error) {
            return false;
        }
    }

    function setTypingDoneFlag() {
        try {
            window.localStorage.setItem(TYPING_DONE_KEY, 'true');
        } catch (error) {
            // Ignore storage errors.
        }
    }

    function normalizeText(rawText) {
        if (typeof rawText !== 'string') {
            return '';
        }

        return rawText
            .replace(/<CR>/gi, '\n')
            .replace(/<BR>/gi, '\n');
    }

    function typeEffect(element, text, speed) {
        const chars = text.split('');
        let index = 0;
        let currentTextNode = document.createTextNode('');

        element.textContent = '';
        element.appendChild(currentTextNode);

        function typeNext() {
            if (index >= chars.length) {
                return;
            }

            const char = chars[index];
            index += 1;

            if (char === '\n') {
                element.appendChild(document.createElement('br'));
                currentTextNode = document.createTextNode('');
                element.appendChild(currentTextNode);
            } else {
                currentTextNode.textContent += char;
            }

            window.setTimeout(typeNext, speed);
        }

        typeNext();
    }

    function renderStaticText(element) {
        if (!element) {
            return;
        }

        const sourceText = normalizeText(element.getAttribute('data-text'));
        const lines = sourceText.split('\n');
        element.textContent = '';

        lines.forEach((line, index) => {
            element.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) {
                element.appendChild(document.createElement('br'));
            }
        });
    }

    function typeElementOnce(element, speed) {
        if (!element || typedElements.has(element)) {
            return;
        }

        typedElements.add(element);

        if (!hasStartedFirstTyping) {
            hasStartedFirstTyping = true;
            setTypingDoneFlag();
        }

        const sourceText = normalizeText(element.getAttribute('data-text'));
        typeEffect(element, sourceText, speed);
    }

    function isVisibleInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left < (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function typeVisibleElements(elements, speed) {
        elements.forEach((element) => {
            if (isVisibleInViewport(element)) {
                typeElementOnce(element, speed);
            }
        });
    }

    function setupTypingObserver(elements, speed) {
        if (!('IntersectionObserver' in window)) {
            elements.forEach((element) => {
                typeElementOnce(element, speed);
            });
            return;
        }

        const observer = new IntersectionObserver((entries, io) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting || entry.intersectionRatio > 0) {
                    typeElementOnce(entry.target, speed);
                    io.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.01
        });

        elements.forEach((element) => {
            if (!typedElements.has(element)) {
                observer.observe(element);
            }
        });

        typeVisibleElements(elements, speed);

        const checkAfterJump = function () {
            typeVisibleElements(elements, speed);
        };

        window.addEventListener('load', checkAfterJump);
        window.addEventListener('hashchange', checkAfterJump);
        window.setTimeout(checkAfterJump, 0);
        window.requestAnimationFrame(checkAfterJump);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const typingElements = Array.from(document.querySelectorAll(TYPING_SELECTOR));

        if (typingElements.length === 0) {
            return;
        }

        // Always render a readable fallback first so text is never empty.
        typingElements.forEach(renderStaticText);

        if (getTypingDoneFlag()) {
            return;
        }

        setupTypingObserver(typingElements, DEFAULT_TYPING_SPEED);
    });
})();

/* ------------------------------------------------------------------------- */

