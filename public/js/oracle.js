const startButton = document.getElementById('startButton');
const answerButtonsContainer = document.getElementById('answerButtons');
const guessButton = document.getElementById('guessButton');
const continueButton = document.getElementById('continueButton');
const questionElement = document.getElementById('question');
const resultElement = document.getElementById('result');

startButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    questionElement.textContent = data.question;
    answerButtonsContainer.innerHTML = ''; 

    data.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.addEventListener('click', () => handleAnswer(index));
      answerButtonsContainer.appendChild(button);
    });

    startButton.disabled = true;
    answerButtonsContainer.style.display = 'block'; 
  } catch (error) {
    console.error('Error starting The Oracle:', error);
  }
});

const handleAnswer = async (answerIndex) => {
  try {
    const response = await fetch('/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answerIndex })
    });
    const data = await response.json();

    questionElement.textContent = data.question;
    answerButtonsContainer.innerHTML = ''; 

    data.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.addEventListener('click', () => handleAnswer(index));
      answerButtonsContainer.appendChild(button);
    });

    if (data.progress >= 90) { 
      answerButtonsContainer.style.display = 'none'; 
      guessButton.disabled = false;
    }
  } catch (error) {
    console.error('Error processing step:', error);
  }
};

guessButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/guess', {
      method: 'POST',
    });
    const data = await response.json();

    if (data.guessOrResponse.type === 'guess') {
      resultElement.textContent = `The Oracle thinks it's: ${data.guessOrResponse.
