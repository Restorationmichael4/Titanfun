async function fetchFunContent(category) {
    const funContent = document.getElementById("funContent");
    funContent.innerHTML = "Loading...";

    try {
        // Fetch content from the backend
        const response = await fetch(`/api/fun/${category}`);
        const data = await response.json();

        if (response.ok) {
            // Render content
            if (category === "jokes") {
                funContent.innerHTML = `
                    <h2>Joke</h2>
                    <p><strong>${data.result.setup}</strong></p>
                    <p>${data.result.punchline}</p>
                `;
            } else {
                funContent.innerHTML = `
                    <h2>${capitalizeFirstLetter(category)}</h2>
                    <p>${data.result}</p>
                `;
            }
        } else {
            funContent.innerHTML = `<p style="color: red;">${data.error}</p>`;
        }
    } catch (error) {
        console.error("Error fetching content:", error);
        funContent.innerHTML = `<p style="color: red;">An error occurred. Please try again later.</p>`;
    }
}

// Capitalize the first letter of the category name
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
