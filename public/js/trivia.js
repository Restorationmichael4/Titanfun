document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("triviaForm");
    const triviaContainer = document.getElementById("triviaContainer");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const nextButton = document.getElementById("nextQuestion");
    const resultsElement = document.getElementById("results");

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Get form values
        const amount = document.getElementById("questionCount").value;
        const category = document.getElementById("category").value;
        const difficulty = document.getElementById("difficulty").value;
        const type = document.getElementById("type").value;

        // Build API URL
        let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;
        if (category) apiUrl += `&category=${category}`;
        if (difficulty) apiUrl += `&difficulty=${difficulty}`;
        if (type) apiUrl += `&type=${type}`;

        // Fetch questions
        const response = await fetch(apiUrl);
        const data = await response.json();
        questions = data.results;

        if (questions.length === 0) {
            alert("No questions found. Please try again.");
            return;
        }

        form.classList.add("hidden");
        triviaContainer.classList.remove("hidden");
        displayQuestion();
    });

    const displayQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
        answersElement.innerHTML = "";

        const options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        shuffleArray(options);

        options.forEach((option) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.classList.add("answer");
            li.addEventListener("click", () => checkAnswer(option));
            answersElement.appendChild(li);
        });
    };

    const checkAnswer = (selected) => {
        const currentQuestion = questions[currentQuestionIndex];
        if (selected === currentQuestion.correct_answer) {
            score++;
        }
        currentQuestionIndex++;
        nextButton.classList.remove("hidden");
        answersElement.childNodes.forEach((node) => node.removeEventListener("click", checkAnswer));
    };

    nextButton.addEventListener("click", () => {
        if (currentQuestionIndex >= questions.length) {
            displayResults();
        } else {
            nextButton.classList.add("hidden");
            displayQuestion();
        }
    });

    const displayResults = () => {
        triviaContainer.classList.add("hidden");
        resultsElement.classList.remove("hidden");
        resultsElement.innerHTML = `<p>You scored ${score} out of ${questions.length}</p>`;
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };
});
