document.getElementById("horoscopeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const month = document.getElementById("month").value;
    const day = document.getElementById("day").value;
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "Processing...";

    try {
        const response = await fetch("/api/horoscope", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: parseInt(month), day: parseInt(day) })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `
                <h2>Your Zodiac Sign: ${data.sign}</h2>
                <p>${data.prediction}</p>
            `;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = `<p style="color:red;">An error occurred. Please try again.</p>`;
    }
});
