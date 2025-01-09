document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startTrivia");
    const triviaForm = document.getElementById("triviaForm");
    const triviaContainer = document.getElementById("triviaContainer");
    const resultsContainer = document.getElementById("resultsContainer");
    const resultsContent = document.getElementById("resultsContent");
    const backToTriviaButton = document.getElementById("backToTrivia");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const nextButton = document.getElementById("nextQuestion");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];

    // Fetch questions from API
    const fetchQuestions = async (url) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("Error fetching trivia questions:", error);
            return [];
        }
    };

    // Start Trivia
    startButton.addEventListener("click", async () => {
        const amount = document.getElementById("amount").value;
        const category = document.getElementById("category").value;
        const difficulty = document.getElementById("difficulty").value;
        const type = document.getElementById("type").value;

        let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;
        if (category !== "any") apiUrl += `&category=${category}`;
        if (difficulty !== "any") apiUrl += `&difficulty=${difficulty}`;
        if (type !== "any") apiUrl += `&type=${type}`;

        questions = await fetchQuestions(apiUrl);
        if (questions.length === 0) {
            alert("No questions available. Please try again with different settings.");
            return;
        }

        // Reset variables
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];

        // Hide form and show trivia container
        triviaForm.style.display = "none";
        triviaContainer.style.display = "block";

        displayQuestion();
    });

    // Display a question
    const displayQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.innerHTML = currentQuestion.question;

        answersElement.innerHTML = "";
        const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        shuffleArray(allAnswers).forEach((answer) => {
            const button = document.createElement("button");
            button.textContent = answer;
            button.className = "answer-button";
            button.addEventListener("click", () => handleAnswer(answer));
            answersElement.appendChild(button);
        });
    };

    // Handle Answer Selection
    const handleAnswer = (selectedAnswer) => {
        const currentQuestion = questions[currentQuestionIndex];
        userAnswers.push({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correct_answer,
            selectedAnswer,
        });

        if (selectedAnswer === currentQuestion.correct_answer) {
            score++;
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    };

    // Show Results
    const showResults = () => {
        triviaContainer.style.display = "none";
        resultsContainer.style.display = "block";

        const percentage = Math.round((score / questions.length) * 100);

        let resultHTML = `
            <h3>Your Results:</h3>
            <p>Score: ${score}/${questions.length}</p>
            <p>Percentage: ${percentage}%</p>
            <h4>Correct Answers:</h4>
            <ul>
        `;

        userAnswers.forEach((entry) => {
            resultHTML += `
                <li>
                    <strong>Question:</strong> ${entry.question} <br>
                    <strong>Your Answer:</strong> ${entry.selectedAnswer} <br>
                    <strong>Correct Answer:</strong> ${entry.correctAnswer}
                </li>
            `;
        });

        resultHTML += "</ul>";
        resultsContent.innerHTML = resultHTML;
    };

    // Shuffle Array (for randomizing answers)
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Back to Trivia
    backToTriviaButton.addEventListener("click", () => {
        resultsContainer.style.display = "none";
        triviaForm.style.display = "block";
    });
});
