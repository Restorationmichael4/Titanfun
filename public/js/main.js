document.addEventListener("DOMContentLoaded", () => {
    const textElement = document.getElementById("animatedText");
    const text = "Developed by Restoration Michael";
    let index = 0;

    const typeWriter = () => {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 100); // Adjust typing speed (100ms per letter)
        }
    };

    // Start the typing animation
    typeWriter();
});
// Popup for Support Message
setTimeout(() => {
    // Create the popup element
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '10px';
    popup.style.right = '10px';
    popup.style.width = '300px';
    popup.style.padding = '20px';
    popup.style.backgroundColor = '#fff';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '1000';
    popup.style.textAlign = 'center';

    // Add popup content
    popup.innerHTML = `
        <p style="margin: 0 0 10px; font-weight: bold;">Support Us!</p>
        <p style="margin: 0 0 10px;">Refer us to your friends and help us grow.</p>
        <button id="closePopup" style="background-color: #007BFF; color: #fff; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">Close</button>
    `;

    // Add the popup to the body
    document.body.appendChild(popup);

    // Close popup functionality
    document.getElementById('closePopup').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}, 20 * 60 * 1000); // 20 minutes in milliseconds

// Hamburger Menu Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
    const menu = document.getElementById("menu-items");
    menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
});
