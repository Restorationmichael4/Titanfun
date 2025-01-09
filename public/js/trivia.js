let triviaData = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;

// Fetch Trivia Data
function fetchTriviaData(url) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            triviaData = data.results;
            totalQuestions = triviaData.length;
            currentQuestionIndex = 0;
            score = 0;
            displayQuestion();
        })
        .catch((error) => {
            console.error("Error fetching trivia data:", error);
        });
}

// Display Question
function displayQuestion() {
    if (currentQuestionIndex >= triviaData.length) {
        displayResults();
        return;
    }

    const questionData = triviaData[currentQuestionIndex];
    const questionContainer = document.getElementById("triviaContainer");
    const answersContainer = document.getElementById("answers");

    // Clear previous content
    questionContainer.querySelector("#question").textContent = decodeHTML(questionData.question);
    answersContainer.innerHTML = "";

    // Shuffle and display answers
    const answers = [...questionData.incorrect_answers, questionData.correct_answer].sort(() => Math.random() - 0.5);

    answers.forEach((answer) => {
        const answerItem = document.createElement("li");
        answerItem.textContent = decodeHTML(answer);
        answerItem.addEventListener("click", () => handleAnswer(answer === questionData.correct_answer, answerItem));
        answersContainer.appendChild(answerItem);
    });
}

// Handle Answer Selection
function handleAnswer(isCorrect, selectedAnswerElement) {
    const questionData = triviaData[currentQuestionIndex];
    const answersContainer = document.getElementById("answers");

    // Highlight the correct answer
    answersContainer.childNodes.forEach((answerElement) => {
        if (answerElement.textContent === decodeHTML(questionData.correct_answer)) {
            answerElement.style.backgroundColor = "green";
        } else {
            answerElement.style.backgroundColor = "red";
        }
    });

    // Increment score if correct
    if (isCorrect) {
        score++;
    }

    // Wait 10 seconds, then move to the next question
    setTimeout(() => {
        currentQuestionIndex++;
        answersContainer.innerHTML = ""; // Clear answers
        displayQuestion();
    }, 10000);
}

// Display Final Results
function displayResults() {
    const triviaContainer = document.getElementById("triviaContainer");
    const resultsContainer = document.getElementById("resultsContainer");

    // Hide trivia container and show results
    triviaContainer.style.display = "none";
    resultsContainer.style.display = "block";

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);

    // Display results
    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = `
        <p>You answered ${score} out of ${totalQuestions} questions correctly.</p>
        <p>Your score: ${percentage}%</p>
        <h3>Correct Answers:</h3>
        <ul>
            ${triviaData
                .map(
                    (q, index) => `
                <li>
                    <strong>Q${index + 1}:</strong> ${decodeHTML(q.question)}
                    <br>
                    <strong>Answer:</strong> ${decodeHTML(q.correct_answer)}
                </li>
            `
                )
                .join("")}
        </ul>
    `;
}

// Decode HTML entities (for special characters in trivia questions)
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Back to Trivia Menu
document.getElementById("backToTrivia").addEventListener("click", () => {
    window.location.href = "trivia.html";
});

// Start Trivia
document.getElementById("triviaForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    // Build API URL
    const baseUrl = "https://opentdb.com/api.php";
    const questionCount = document.getElementById("questionCount").value || 10;
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;
    const type = document.getElementById("type").value;

    let apiUrl = `${baseUrl}?amount=${questionCount}`;
    if (category) apiUrl += `&category=${category}`;
    if (difficulty) apiUrl += `&difficulty=${difficulty}`;
    if (type) apiUrl += `&type=${type}`;

    // Fetch trivia data
    fetchTriviaData(apiUrl);

    // Hide form and show trivia container
    document.getElementById("triviaForm").style.display = "none";
    document.getElementById("triviaContainer").style.display = "block";
});
