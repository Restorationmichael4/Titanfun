document.addEventListener("DOMContentLoaded", () => {
    const toolSelect = document.getElementById("toolSelect");
    const toolQuery = document.getElementById("toolQuery");
    const submitButton = document.getElementById("submitButton");
    const result = document.getElementById("result");
    const extraInput = document.getElementById("extraInput");
    const colorInput = document.getElementById("colorInput");

    // Show/Hide extra input for TTP
    toolSelect.addEventListener("change", () => {
        if (toolSelect.value === "ttp") {
            extraInput.style.display = "block";
        } else {
            extraInput.style.display = "none";
        }
    });

    submitButton.addEventListener("click", async () => {
        const tool = toolSelect.value;
        const query = toolQuery.value;
        const color = colorInput.value;

        if (!query) {
            result.innerHTML = `<p style="color: red;">Please enter a query.</p>`;
            return;
        }

        result.innerHTML = "Loading...";

        try {
            const response = await fetch(`/api/tools/${tool}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, color }),
            });
            const data = await response.json();

            if (response.ok) {
                renderResult(tool, data);
            } else {
                result.innerHTML = `<p style="color: red;">${data.error}</p>`;
            }
        } catch (error) {
            console.error("Error fetching tool data:", error);
            result.innerHTML = `<p style="color: red;">An error occurred. Please try again.</p>`;
        }
    });

    function renderResult(tool, data) {
        if (tool === "obsfuscate" || tool === "ebinary" || tool === "dbinary") {
            result.innerHTML = `
                <p><strong>Result:</strong> ${data.result || data.encrypted_code}</p>
                <button onclick="copyText('${data.result || data.encrypted_code}')">Copy</button>
            `;
        } else if (tool === "ssweb" || tool === "createqr") {
            result.innerHTML = `
                <img src="${data.result || data.url}" alt="Preview" style="max-width: 100%; height: auto;">
                <a href="${data.result || data.url}" download>
                    <button>Download</button>
                </a>
            `;
        } else if (tool === "ttp") {
            result.innerHTML = `
                <img src="${data.results[0].url}" alt="Sticker" style="max-width: 100%; height: auto;">
                <a href="${data.results[0].url}" download>
                    <button>Download</button>
                </a>
            `;
        } else if (tool === "fancy") {
            result.innerHTML = `
                <h3>Fancy Text Variations:</h3>
                <ul>
                    ${data.results.map((item) => `<li>${item.result}</li>`).join("")}
                </ul>
            `;
        }
    }
});

// Function to Copy Text
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    });
}
