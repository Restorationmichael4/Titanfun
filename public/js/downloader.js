document.getElementById("downloaderForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const platform = document.getElementById("platform").value;
    const url = document.getElementById("url").value.trim();
    const messageDiv = document.getElementById("message");
    const statusMessage = document.getElementById("statusMessage");

    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    statusMessage.textContent = "Processing your request...";
    messageDiv.classList.remove("hidden");

    try {
        const response = await fetch(`/api/downloader`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform, url })
        });

        const data = await response.json();

        if (response.ok && data.downloadUrl) {
            let outputHtml = `<a href="${data.downloadUrl}" download class="btn">Download Now</a>`;

            if (data.thumbnail) {
                outputHtml = `
                    <img src="${data.thumbnail}" alt="Thumbnail" style="max-width: 300px; display: block; margin: 10px auto;">
                    ${outputHtml}
                `;
            }

            if (data.title) {
                outputHtml = `<p>Title: ${data.title}</p>${outputHtml}`;
            }

            if (data.quality) {
                outputHtml = `<p>Quality: ${data.quality}</p>${outputHtml}`;
            }

            if (data.fileName) {
                outputHtml = `<p>File Name: ${data.fileName}</p>${outputHtml}`;
            }

            statusMessage.innerHTML = outputHtml;
        } else {
            statusMessage.textContent = `Error: ${data.error || "Failed to process the request."}`;
        }
    } catch (error) {
        console.error("Error:", error);
        statusMessage.textContent = "Error: Could not process your request.";
    }
});
