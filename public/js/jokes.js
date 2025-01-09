document.addEventListener("DOMContentLoaded", () => {
    const jokeCategorySelect = document.getElementById("jokeCategory");
    const fetchJokeButton = document.getElementById("fetchJoke");
    const jokeDisplay = document.getElementById("jokeDisplay");

    // Function to fetch and display a joke
    const fetchJoke = async () => {
        const category = jokeCategorySelect.value;
        const apiUrl = `https://v2.jokeapi.dev/joke/${category}?format=txt`;

        try {
            // Fetch joke from API
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch joke");

            const joke = await response.text();

            // Display the joke
            jokeDisplay.textContent = joke;
        } catch (error) {
            console.error("Error fetching joke:", error);
            jokeDisplay.textContent = "Oops! Something went wrong. Please try again.";
        }
    };

    // Event listener for the button
    fetchJokeButton.addEventListener("click", fetchJoke);
});
