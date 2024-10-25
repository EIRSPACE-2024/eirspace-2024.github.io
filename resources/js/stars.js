const starField = document.querySelector('.star-field');
const numberOfStars = 100; // Nombre d'étoiles à générer

// Fonction pour créer une étoile
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    // Position aléatoire pour chaque étoile
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    // Taille aléatoire de l'étoile
    const size = Math.random() * 3 + 1; // Taille entre 1 et 4 pixels
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    starField.appendChild(star);
}

// Générer les étoiles
for (let i = 0; i < numberOfStars; i++) {
    createStar();
}

