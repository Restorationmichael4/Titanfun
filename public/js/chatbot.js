document.getElementById("chatbotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const chatbot = document.getElementById("chatbot").value;
    const query = document.getElementById("query").value.trim();
    const messageDiv = document.getElementById("message");
    const responseDiv = document.getElementById("response");

    messageDiv.textContent = "Processing...";
    responseDiv.innerHTML = "";

    if (!query) {
        messageDiv.textContent = "Please enter a query.";
        return;
    }

    try {
        const response = await fetch("/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatbot, query })
        });

        const data = await response.json();

        if (response.ok) {
            responseDiv.innerHTML = `<p><strong>${chatbot}:</strong> ${data.message}</p>`;
            messageDiv.textContent = "Success!";
        } else {
            messageDiv.textContent = `Error: ${data.error || "Failed to process the request."}`;
        }
    } catch (error) {
        console.error("Error:", error);
        messageDiv.textContent = "An error occurred. Please try again.";
    }
});
