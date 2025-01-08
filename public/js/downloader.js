document.getElementById("downloaderForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const platform = document.getElementById("platform").value;
    const url = document.getElementById("url").value.trim();
    const messageDiv = document.getElementById("message");
    const statusMessage = document.getElementById("statusMessage");

    // Validate input
    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    // Show loading message
    statusMessage.textContent = "Processing your request...";
    messageDiv.classList.remove("hidden");

    try {
        // Send request to the backend
        const response = await fetch(`/api/downloader`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform, url }),
        });

        const data = await response.json();

        if (response.ok && data.downloadUrl) {
            // Trigger the download in the browser
            const downloadLink = document.createElement("a");
            downloadLink.href = data.downloadUrl;
            downloadLink.download = ""; // Let the browser determine the filename
            downloadLink.click();

            statusMessage.textContent = "Download started successfully!";
        } else {
            statusMessage.textContent = `Error: ${data.error || "Failed to process the request."}`;
        }
    } catch (error) {
        console.error("Error:", error);
        statusMessage.textContent = "Error: Could not process your request.";
    }
});
