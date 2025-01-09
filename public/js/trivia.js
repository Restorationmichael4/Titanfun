document.addEventListener("DOMContentLoaded", () => {
    const triviaForm = document.getElementById("triviaForm");
    const triviaContainer = document.getElementById("triviaContainer");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const resultsElement = document.getElementById("results");
    const startTriviaButton = document.getElementById("startTrivia");
    const restartTriviaButton = document.getElementById("restartTrivia");

    let triviaData = [];
    let currentQuestionIndex = 0;
    let score = 0;

    triviaForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Fetch trivia settings from the form
        const questionCount = document.getElementById("questionCount").value || 10;
        const category = document.getElementById("category").value || "";
        const difficulty = document.getElementById("difficulty").value || "";
        const type = document.getElementById("type").value || "";

        // Build the API URL based on user settings
        let apiUrl = `https://opentdb.com/api.php?amount=${questionCount}`;
        if (category) apiUrl += `&category=${category}`;
        if (difficulty) apiUrl += `&difficulty=${difficulty}`;
        if (type) apiUrl += `&type=${type}`;

        try {
            // Fetch trivia data
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.response_code !== 0 || !data.results.length) {
                alert("No questions available for the selected settings. Please try again.");
                return;
            }

            // Initialize trivia data and start the quiz
            triviaData = data.results;
            currentQuestionIndex = 0;
            score = 0;

            startTrivia();
        } catch (error) {
            console.error("Error fetching trivia data:", error);
            alert("Error fetching trivia data. Please try again.");
        }
    });

    const startTrivia = () => {
        triviaForm.style.display = "none";
        resultsElement.style.display = "none";
        triviaContainer.style.display = "block";
        displayQuestion();
    };

    const displayQuestion = () => {
        // Clear previous answers
        answersElement.innerHTML = "";

        // Get current question data
        const questionData = triviaData[currentQuestionIndex];
        questionElement.innerHTML = questionData.question;

        // Combine and shuffle answers
        const answers = [...questionData.incorrect_answers, questionData.correct_answer].sort(() => Math.random() - 0.5);

        answers.forEach((answer) => {
            const button = document.createElement("button");
            button.textContent = answer;
            button.className = "answer-button";
            button.addEventListener("click", () => handleAnswer(answer));
            answersElement.appendChild(button);
        });
    };

    const handleAnswer = (selectedAnswer) => {
        const questionData = triviaData[currentQuestionIndex];

        // Check if the answer is correct
        if (selectedAnswer === questionData.correct_answer) {
            score++;
        }

        // Move to the next question or show results
        currentQuestionIndex++;
        if (currentQuestionIndex < triviaData.length) {
            displayQuestion();
        } else {
            showResults();
        }
    };

    const showResults = () => {
        triviaContainer.style.display = "none";
        resultsElement.style.display = "block";

        // Display score and percentage
        const totalQuestions = triviaData.length;
        const percentage = ((score / totalQuestions) * 100).toFixed(2);
        const resultHTML = `
            <h2>Your Results</h2>
            <p><strong>Score:</strong> ${score} out of ${totalQuestions}</p>
            <p><strong>Percentage:</strong> ${percentage}%</p>
            <h3>Correct Answers:</h3>
            <ul>
                ${triviaData
                    .map(
                        (question) => `
                    <li>
                        <strong>Question:</strong> ${question.question}<br>
                        <strong>Correct Answer:</strong> ${question.correct_answer}
                    </li>
                `
                    )
                    .join("")}
            </ul>
        `;
        resultsElement.innerHTML = resultHTML;

        // Show restart button
        restartTriviaButton.style.display = "block";
    };

    restartTriviaButton.addEventListener("click", () => {
        resultsElement.style.display = "none";
        restartTriviaButton.style.display = "none";
        triviaForm.style.display = "block";
    });
});
