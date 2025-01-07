// Fetch and display stories
async function fetchStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = '<p>Loading stories...</p>';

    try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error('Error fetching stories.');

        const data = await response.json();
        container.innerHTML = data.map(story => `
            <div class="p-4 bg-gradient-to-r from-gold to-red rounded-md">
                <h3 class="font-bold text-xl">${story.title}</h3>
                <p><strong>Category:</strong> ${story.category}</p>
                <p>${story.content}</p>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">${err.message}</p>`;
    }
}

// Submit a new story
document.getElementById('story-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('story-title').value.trim();
    const content = document.getElementById('story-content').value.trim();
    const category = document.getElementById('story-category').value;

    try {
        const response = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, category })
        });

        if (!response.ok) throw new Error('Error submitting story.');

        alert('Story submitted successfully!');
        fetchStories(); // Reload stories
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
});

// Load stories on page load
fetchStories();
