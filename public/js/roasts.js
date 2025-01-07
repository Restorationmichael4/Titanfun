document.getElementById('roast-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const roast = document.getElementById('roast-input').value.trim();
    const resultDiv = document.getElementById('comeback-result');

    if (!roast) {
        resultDiv.innerHTML = '<p class="text-red-500">Please enter a roast.</p>';
        return;
    }

    resultDiv.innerHTML = '<p>Generating comeback...</p>';

    try {
        const response = await fetch('/api/comeback');
        if (!response.ok) throw new Error('Error fetching comeback.');

        const data = await response.json();
        resultDiv.innerHTML = `<p>${data.comeback}</p>`;
    } catch (err) {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
});
