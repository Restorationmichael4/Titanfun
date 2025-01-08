document.getElementById("funForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const feature = document.getElementById("feature").value;
    const messageDiv = document.getElementById("message");
    const resultDiv = document.getElementById("result");
    messageDiv.textContent = "Processing...";
    resultDiv.innerHTML = "";

    try {
        const response = await fetch("/api/fun", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature })
        });

        const data = await response.json();

        if (response.ok) {
            if (feature === "truth" || feature === "dare") {
                resultDiv.innerHTML = `
                    <h3>${data.type}</h3>
                    <p>${data.question}</p>
                `;
            } else if (feature === "pickupline") {
                resultDiv.innerHTML = `
                    <h3>Pickup Line</h3>
                    <p>${data.pickupline}</p>
                `;
            } else if (feature === "fact") {
                resultDiv.innerHTML = `
                    <h3>Fact</h3>
                    <p>${data.fact}</p>
                `;
            }
        } else {
            messageDiv.textContent = `Error: ${data.error || "Failed to process the request."}`;
        }
    } catch (error) {
        console.error("Error:", error);
        messageDiv.textContent = "An error occurred. Please try again.";
    }
});
