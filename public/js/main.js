// Main script for shared functionality across Titan Fun

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('bg-black');
    body.classList.toggle('text-gold');
    localStorage.setItem('darkMode', body.classList.contains('bg-black') ? 'enabled' : 'disabled');
}

// Function to initialize dark mode based on user preference
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('bg-black', 'text-gold');
    } else {
        document.body.classList.remove('bg-black', 'text-gold');
    }
}

// Function to add navigation dynamically to all pages
function addNavigation() {
    const nav = document.createElement('nav');
    nav.className = 'p-4 bg-gradient-to-r from-gold to-red text-center';
    nav.innerHTML = `
        <a href="index.html" class="px-4 py-2 text-white">Home</a>
        <a href="horoscope.html" class="px-4 py-2 text-white">Horoscope</a>
        <a href="pickup.html" class="px-4 py-2 text-white">Pick-up Lines</a>
        <a href="dictionary.html" class="px-4 py-2 text-white">Dictionary</a>
        <a href="memes.html" class="px-4 py-2 text-white">Memes</a>
        <a href="stories.html" class="px-4 py-2 text-white">Stories</a>
        <a href="roasts.html" class="px-4 py-2 text-white">Roasts</a>
        <button id="dark-mode-toggle" class="px-4 py-2 text-white bg-black rounded-md">
            Toggle Dark Mode
        </button>
    `;
    document.body.prepend(nav);

    // Attach dark mode toggle listener
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
}

// Function to display a footer dynamically
function addFooter() {
    const footer = document.createElement('footer');
    footer.className = 'text-center text-sm text-gray-400 py-4';
    footer.innerHTML = `© 2025 Titan Fun`;
    document.body.appendChild(footer);
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    addNavigation();
    addFooter();
});
