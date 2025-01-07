document.getElementById('next-meme-btn').addEventListener('click', async () => {
    const titleElement = document.getElementById('meme-title');
    const imageElement = document.getElementById('meme-image');
    const downloadButton = document.getElementById('download-btn');

    try {
        const response = await fetch('/api/meme');
        if (!response.ok) throw new Error('Error fetching meme.');

        const data = await response.json();
        titleElement.textContent = data.title;
        imageElement.src = data.url;
        downloadButton.href = data.url;
    } catch (err) {
        titleElement.textContent = 'Error loading meme.';
        imageElement.src = '';
        downloadButton.href = '#';
    }
});
