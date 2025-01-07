document.getElementById('new-line-btn').addEventListener('click', async () => {
    const lineDiv = document.getElementById('pickup-line');

    try {
        const response = await fetch('/api/pickup-line');
        if (!response.ok) throw new Error('Error fetching pick-up line.');

        const data = await response.json();
        lineDiv.innerHTML = `<p>${data.line}</p>`;
    } catch (err) {
        lineDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
});
