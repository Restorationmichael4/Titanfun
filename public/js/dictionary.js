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
        if (!response.ok) {
            throw new Error('Word not found or API error.');
        }

        const data = await response.json();

        // Parse the API response
        const phonetic = data.phonetic ? `<p><strong>Phonetic:</strong> ${data.phonetic}</p>` : '';
        const meanings = data.meanings.map(meaning => `
            <p><strong>${meaning.partOfSpeech}:</strong> ${meaning.definitions.join('; ')}</p>
            ${meaning.examples.length ? `<p><strong>Examples:</strong> ${meaning.examples.join('<br>')}</p>` : ''}
        `).join('');

        resultDiv.innerHTML = `
            <div>
                <h2 class="text-lg font-bold">Results for "${data.word}":</h2>
                ${phonetic}
                ${meanings}
            </div>
        `;
    } catch (err) {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
});
