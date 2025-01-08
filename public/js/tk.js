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
            const response = await fetch(`/api/tools/${tool}?query=${encodeURIComponent(query)}${tool === "ttp" && color ? `&color=${encodeURIComponent(color)}` : ""}`);
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
        if (tool === "ebinary" || tool === "dbinary") {
            result.innerHTML = `
                <p><strong>Result:</strong> ${data.result}</p>
                <button onclick="copyText('${data.result}')">Copy</button>
            `;
        } else if (tool === "createqr" || tool === "ssweb" || tool === "ttp") {
            result.innerHTML = `
                <img src="${data.url || data.result}" alt="Preview" style="max-width: 100%; height: auto;">
                <a href="${data.url || data.result}" download>
                    <button>Download</button>
                </a>
            `;
        } else if (tool === "fancy") {
            const randomText = data.results[Math.floor(Math.random() * data.results.length)].result;
            result.innerHTML = `
                <p><strong>Fancy Text:</strong> ${randomText}</p>
                <button onclick="copyText('${randomText}')">Copy</button>
            `;
        } else {
            result.innerHTML = `<p style="color: red;">Unsupported tool selected.</p>`;
        }
    }
});

// Function to Copy Text
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    });
}
