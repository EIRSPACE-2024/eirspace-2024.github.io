function createShootingStar() {
    const starContainer = document.querySelector('.shooting-star-field');

    const star = document.createElement('div');
    star.classList.add('shooting-star');

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight / 2);

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    starContainer.appendChild(star);

    setTimeout(() => {
        starContainer.removeChild(star);
    }, 2000); // CSS Animation stops after 2s.
}

setInterval(createShootingStar, 6000);

