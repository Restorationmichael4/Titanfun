// google.js

// Define the API endpoint and key
const API_URL = "https://api.giftedtech.web.id/api/search/google";
const API_KEY = "gifted";

// Handle the search form submission
document.getElementById("google-search-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the form from reloading the page

  // Get the search query
  const query = document.getElementById("query").value;

  // Display a loading message
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "<p>Loading results...</p>";

  try {
    // Fetch results from the API
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();

    // Check if the API returned results
    if (data.success && data.results.length > 0) {
      // Display the results
      resultsContainer.innerHTML = data.results
        .map(
          (result) => `
          <div class="result-item">
            <h3><a href="${result.url}" target="_blank">${result.title}</a></h3>
            <p>${result.description}</p>
          </div>
        `
        )
        .join("");
    } else {
      // No results found
      resultsContainer.innerHTML = "<p>No results found. Please try a different query.</p>";
    }
  } catch (error) {
    // Handle errors
    resultsContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`;
  }
});
