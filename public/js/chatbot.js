document.getElementById("chatbotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const model = document.getElementById("model").value;
    const query = document.getElementById("query").value.trim();
    const responseDiv = document.getElementById("response");
    const responseText = document.getElementById("responseText");

    if (!query) {
        alert("Please enter a query.");
        return;
    }

    responseText.textContent = "Fetching response...";
    responseDiv.classList.remove("hidden");

    try {
        const response = await fetch(`/api/chatbot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, query }),
        });

        const data = await response.json();

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
