document.addEventListener("DOMContentLoaded", async () => {
    const triviaContainer = document.getElementById("triviaContainer");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const resultsElement = document.getElementById("results");
    const backToTriviaButton = document.getElementById("backToTrivia");

    // Get query parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get("amount") || 10;
    const category = urlParams.get("category");
    const difficulty = urlParams.get("difficulty");
    const type = urlParams.get("type");

    // Construct API URL
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;
    if (category) apiUrl += `&category=${category}`;
    if (difficulty) apiUrl += `&difficulty=${difficulty}`;
    if (type) apiUrl += `&type=${type}`;

    let currentQuestionIndex = 0;
    let score = 0;
    let totalQuestions = 0;
    let triviaData = [];

    // Fetch trivia questions
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.response_code === 0) {
            triviaData = data.results;
            totalQuestions = triviaData.length;
            displayQuestion();
        } else {
            questionElement.textContent = "No trivia questions available. Please try again!";
        }
    } catch (error) {
        questionElement.textContent = "Failed to fetch trivia questions. Please check your internet connection.";
        console.error("Error fetching trivia:", error);
    }

    // Display a question
    function displayQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            displayResults();
            return;
        }

        const currentQuestion = triviaData[currentQuestionIndex];
        questionElement.innerHTML = decodeHTML(currentQuestion.question);

        // Display answers
        answersElement.innerHTML = "";
        const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        shuffleArray(allAnswers).forEach((answer) => {
            const li = document.createElement("li");
            li.textContent = decodeHTML(answer);
            li.addEventListener("click", () => handleAnswerClick(answer === currentQuestion.correct_answer));
            answersElement.appendChild(li);
        });
    }

    // Handle answer click
    function handleAnswerClick(isCorrect) {
        // Highlight the correct answer in green
        Array.from(answersElement.children).forEach((li) => {
            if (li.textContent === decodeHTML(triviaData[currentQuestionIndex].correct_answer)) {
                li.style.backgroundColor = "green";
                li.style.color = "white";
            } else {
                li.style.backgroundColor = "red";
                li.style.color = "white";
            }
        });

        // Update score
        if (isCorrect) score++;

        // Wait 2 seconds before moving to the next question
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 2000);
    }

    // Display results
    function displayResults() {
        triviaContainer.classList.add("hidden");
        resultsElement.classList.remove("hidden");
        backToTriviaButton.classList.remove("hidden");

        const percentage = ((score / totalQuestions) * 100).toFixed(2);

        let resultsHTML = `<h2>Trivia Complete!</h2>`;
        resultsHTML += `<p>Score: ${score} / ${totalQuestions}</p>`;
        resultsHTML += `<p>Percentage: ${percentage}%</p>`;
        resultsHTML += `<h3>Correct Answers:</h3><ul>`;

        triviaData.forEach((question, index) => {
            resultsHTML += `<li><strong>Q${index + 1}:</strong> ${decodeHTML(question.question)}<br><em>Answer:</em> ${decodeHTML(
                question.correct_answer
            )}</li>`;
        });

        resultsHTML += `</ul>`;
        resultsElement.innerHTML = resultsHTML;
    }

    // Back to Trivia button functionality
    backToTriviaButton.addEventListener("click", () => {
        window.location.href = "trivia.html";
    });

    // Utility: Decode HTML entities
    function decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    // Utility: Shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
