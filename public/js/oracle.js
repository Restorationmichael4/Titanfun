let sessionId = null;

const startButton = document.getElementById('start-button');
const questionContainer = document.getElementById('game-container');
const questionElement = document.getElementById('question');
const answersContainer = document.getElementById('answers');

// Function to start the game
async function startGame() {
    try {
        const response = await fetch('/api/oracle/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ region: 'en' }) // Default to English
        });

        const data = await response.json();
        sessionId = data.sessionId;

        displayQuestion(data.question, data.answers);
    } catch (error) {
        console.error('Error starting game:', error);
    }
}

// Function to display a question and possible answers
function displayQuestion(question, answers) {
    questionElement.textContent = question;
    answersContainer.innerHTML = '';

    answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => submitAnswer(index);
        answersContainer.appendChild(button);
    });
}

// Function to submit an answer
async function submitAnswer(answerIndex) {
    try {
        const response = await fetch('/api/oracle/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, answer: answerIndex })
        });

        const data = await response.json();

        if (data.guessReady) {
            showGuess();
        } else {
            displayQuestion(data.question, data.answers);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

// Function to show Akinator's guess
async function showGuess() {
    try {
        const response = await fetch('/api/oracle/guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();
        questionElement.textContent = `The Oracle's Guess: ${data.name}`;
        answersContainer.innerHTML = `
            <p>${data.description}</p>
            <img src="${data.image}" alt="${data.name}">
        `;
    } catch (error) {
        console.error('Error showing guess:', error);
    }
}

// Event listener to start the game
startButton.addEventListener('click', startGame);
