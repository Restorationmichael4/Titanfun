document.addEventListener("DOMContentLoaded", async () => {
    const memesContainer = document.getElementById("memesContainer");

    try {
        // Fetch memes from the backend
        const response = await fetch("/api/memes");
        const memes = await response.json();

        // Render memes
        memes.forEach((meme, index) => {
            const memeCard = document.createElement("div");
            memeCard.className = "meme-card";

            memeCard.innerHTML = `
                <img src="${meme}" alt="Meme ${index + 1}">
                <button onclick="downloadMeme('${meme}')">Download</button>
            `;

            memesContainer.appendChild(memeCard);
        });
    } catch (error) {
        console.error("Failed to load memes:", error);
        memesContainer.innerHTML = `<p style="color: red;">Failed to load memes. Please try again later.</p>`;
    }
});

// Function to download a meme
function downloadMeme(memeUrl) {
    const link = document.createElement("a");
    link.href = memeUrl + "=download"; // Add "=download" to the URL for immediate download
    link.download = `meme-${Date.now()}.jpg`; // Dynamic filename
    link.click();
}
