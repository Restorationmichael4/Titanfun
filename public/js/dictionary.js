document.getElementById('dictionary-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const word = document.getElementById('word-input').value.trim();
    const resultDiv = document.getElementById('dictionary-result');

    if (!word) {
        resultDiv.innerHTML = `<p class="text-red-500">Please enter a word.</p>`;
        return;
    }

    resultDiv.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/dictionary?word=${word}`);
        if (!response.ok) throw new Error('Word not found or API error.');

        const data = await response.json();

        const definitions = data.definitions.map((def, idx) => `<p>${idx + 1}. ${def}</p>`).join('');
        const synonyms = data.synonyms.length ? `<p><strong>Synonyms:</strong> ${data.synonyms.join(', ')}</p>` : '';
        const examples = data.examples.length ? `<p><strong>Examples:</strong> ${data.examples.join('<br>')}</p>` : '';

        resultDiv.innerHTML = `<div>
            <h2 class="text-lg font-bold">Results for "${word}":</h2>
            ${definitions}
            ${synonyms}
            ${examples}
        </div>`;
    } catch (err) {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
});
