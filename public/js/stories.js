// Function to fetch all stories and display their titles
function fetchStories() {
    fetch('/api/stories')
        .then(response => response.json())
        .then(data => {
            const storiesList = document.getElementById('stories-list');
            storiesList.innerHTML = ''; // Clear any existing stories

            data.forEach(story => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="story.html?id=${story.id}" class="story-title">
                        ${story.title}
                    </a>`;
                storiesList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching stories:', error));
}

// Function to fetch a single story's details by its ID
function fetchStoryDetails(storyId) {
    fetch(`/api/stories/${storyId}`)
        .then(response => response.json())
        .then(data => {
            const titleElement = document.getElementById('story-title');
            const contentElement = document.getElementById('story-content');
            titleElement.textContent = data.title;
            contentElement.textContent = data.content;
        })
        .catch(error => console.error('Error fetching story details:', error));
}

// Function to fetch and display trending stories
function fetchTrendingStories() {
    fetch('/api/stories/trending')
        .then(response => response.json())
        .then(data => {
            const trendingList = document.getElementById('trending-list');
            trendingList.innerHTML = ''; // Clear any existing trending stories

            data.forEach(story => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="story.html?id=${story.id}" class="trending-story">
                        ${story.title} (Views: ${story.views})
                    </a>`;
                trendingList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching trending stories:', error));
}

// Function to handle story submission
function submitStory(event) {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById('story-title-input').value.trim();
    const content = document.getElementById('story-content-input').value.trim();
    const category = document.getElementById('story-category-input').value.trim();

    if (!title || !content || !category) {
        alert('All fields are required!');
        return;
    }

    fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
    })
        .then(response => {
            if (response.ok) {
                alert('Story submitted successfully!');
                fetchStories(); // Refresh the story list
                document.getElementById('story-form').reset(); // Clear the form
            } else {
                alert('Error submitting story.');
            }
        })
        .catch(error => console.error('Error submitting story:', error));
}

// Event listeners for page-specific functionalities
document.addEventListener('DOMContentLoaded', () => {
    const storiesList = document.getElementById('stories-list');
    const trendingList = document.getElementById('trending-list');
    const storyForm = document.getElementById('story-form');
    const storyId = new URLSearchParams(window.location.search).get('id');

    // If on the main stories page, fetch stories and trending stories
    if (storiesList || trendingList) {
        fetchStories();
        fetchTrendingStories();
    }

    // If on a single story's page, fetch its details
    if (storyId) {
        fetchStoryDetails(storyId);
    }

    // If the story form exists, set up the submit handler
    if (storyForm) {
        storyForm.addEventListener('submit', submitStory);
    }
});
