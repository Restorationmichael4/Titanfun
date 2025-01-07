document.getElementById('horoscope-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const birthDate = document.getElementById('birth-date').value;
    const resultDiv = document.getElementById('horoscope-result');

    try {
        const response = await fetch(`/api/horoscope?birthdate=${birthDate}`);
        if (!response.ok) throw new Error('Error fetching horoscope.');

        const data = await response.json();
        resultDiv.innerHTML = `<p>Your horoscope for today:</p><p>${data.horoscope}</p>`;
    } catch (err) {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
});
