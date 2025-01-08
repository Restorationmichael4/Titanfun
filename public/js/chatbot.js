// Chatbot form submission handler
document.getElementById("chatbotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get selected model and query from the form
    const model = document.getElementById("model").value;
    const query = document.getElementById("query").value.trim();
    const responseDiv = document.getElementById("response");
    const responseText = document.getElementById("responseText");

    // Validate input
    if (!query) {
        alert("Please enter a query.");
        return;
    }

    // Show a loading message while waiting for the response
    responseText.textContent = "Fetching response...";
    responseDiv.classList.remove("hidden");

    try {
        // Send POST request to the backend
        const response = await fetch(`/api/chatbot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, query }),
        });

        const data = await response.json();

        // Handle response from backend
        if (response.ok) {
            responseText.textContent = data.response;
        } else {
            responseText.textContent = `Error: ${data.error || "Failed to fetch response."}`;
        }
    } catch (error) {
        console.error("Error:", error);
        responseText.textContent = "Error: Could not fetch response.";
    }
});
