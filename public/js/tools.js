// Handle tool selection and dynamic input fields
document.getElementById("tool").addEventListener("change", (e) => {
    const tool = e.target.value;
    const inputFields = document.getElementById("inputFields");
    inputFields.innerHTML = ""; // Clear existing inputs

    if (tool === "imgscan" || tool === "remini") {
        inputFields.innerHTML = `
            <label for="url">Image URL:</label>
            <input type="url" id="url" placeholder="Enter the image URL" required>
        `;
    } else if (tool === "lyrics") {
        inputFields.innerHTML = `
            <label for="title">Song Title:</label>
            <input type="text" id="title" placeholder="Enter song title" required>
            <label for="artist">Artist Name:</label>
            <input type="text" id="artist" placeholder="Enter artist name" required>
        `;
    } else if (tool === "tts") {
        inputFields.innerHTML = `
            <label for="text">Text:</label>
            <input type="text" id="text" placeholder="Enter text to convert to speech" required>
        `;
    } else if (tool === "voiceai") {
        inputFields.innerHTML = `
            <label for="text">Text:</label>
            <input type="text" id="text" placeholder="Enter text to process" required>
            <label for="voice">Voice Model:</label>
            <select id="model" required>
                <option value="miku">Miku</option>
                <option value="nahida">Nahida</option>
                <option value="nami">Nami</option>
                <option value="ana">Ana</option>
                <option value="optimus_prime">Optimus Prime</option>
                <option value="goku">Goku</option>
                <option value="taylor_swift">Taylor Swift</option>
                <option value="elon_musk">Elon Musk</option>
                <option value="mickey_mouse">Mickey Mouse</option>
                <option value="kendrick_lamar">Kendrick Lamar</option>
                <option value="angela_adkinsh">Angela Adkinsh</option>
                <option value="eminem">Eminem</option>
            </select>
        `;
    } else if (tool === "weather") {
        inputFields.innerHTML = `
            <label for="city">City Name:</label>
            <input type="text" id="city" placeholder="Enter city name" required>
        `;
    } else if (tool === "bible") {
        inputFields.innerHTML = `
            <label for="reference">Bible Reference:</label>
            <input type="text" id="reference" placeholder="e.g., john+3:16" required>
        `;
    } else if (tool === "diffusion" || tool === "flux") {
        inputFields.innerHTML = `
            <label for="prompt">Prompt:</label>
            <textarea id="prompt" placeholder="Enter prompt for image generation" required></textarea>
        `;
    }
});

// Handle form submission and API request
document.getElementById("toolsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const tool = document.getElementById("tool").value;
    const inputs = {
        text: document.getElementById("text")?.value.trim(),
        url: document.getElementById("url")?.value.trim(),
        title: document.getElementById("title")?.value.trim(),
        artist: document.getElementById("artist")?.value.trim(),
        reference: document.getElementById("reference")?.value.trim(),
        city: document.getElementById("city")?.value.trim(),
        prompt: document.getElementById("prompt")?.value.trim(),
        model: document.getElementById("model")?.value
    };

    const messageDiv = document.getElementById("message");
    const resultDiv = document.getElementById("result");
    messageDiv.textContent = "Processing...";
    resultDiv.innerHTML = "";

    try {
        const response = await fetch(`/api/tools`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool, inputs })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.mediaUrl) {
                if (tool === "tts" || tool === "voiceai") {
                    resultDiv.innerHTML = `
                        <audio controls>
                            <source src="${data.mediaUrl}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                        <a href="${data.mediaUrl}" download>Download</a>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <img src="${data.mediaUrl}" alt="Generated Media" style="max-width: 100%; margin: 10px auto;">
                        <a href="${data.mediaUrl}" download>Download</a>
                    `;
                }
            } else if (data.lyrics) {
                resultDiv.innerHTML = `
                    <h3>${data.title} by ${data.artist}</h3>
                    <pre>${data.lyrics}</pre>
                    <button onclick="navigator.clipboard.writeText('${data.lyrics}')">Copy Lyrics</button>
                `;
            } else if (data.text) {
                resultDiv.innerHTML = `
                    <p>${data.text}</p>
                    <small>${data.translation}</small>
                `;
            } else if (data.temperature) {
                resultDiv.innerHTML = `
                    <h3>Weather for ${data.location}, ${data.country}</h3>
                    <p>${data.description} (${data.weather})</p>
                    <p>Temperature: ${data.temperature}</p>
                    <p>Feels Like: ${data.feels_like}</p>
                    <p>Humidity: ${data.humidity}</p>
                    <p>Pressure: ${data.pressure}</p>
                    <p>Wind Speed: ${data.wind_speed}</p>
                    <p>Coordinates: Lat ${data.coordinates.latitude}, Lon ${data.coordinates.longitude}</p>
                `;
            } else {
                resultDiv.textContent = JSON.stringify(data, null, 2);
            }
        } else {
            messageDiv.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        console.error("Error:", error);
        messageDiv.textContent = "An error occurred. Please try again.";
    }
});
