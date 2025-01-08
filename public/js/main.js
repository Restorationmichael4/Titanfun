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
