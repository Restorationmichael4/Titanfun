document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get("amount") || "10";
    const category = params.get("category") || "";
    const difficulty = params.get("difficulty") || "";
    const type = params.get("type") || "";

    const triviaContainer = document.getElementById("triviaContainer");
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const resultsContainer = document.getElementById("resultsContainer");
    const resultsElement = document.getElementById("results");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    const fetchTrivia = async () => {
        const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        displayQuestion();
    };

    const displayQuestion = () => {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];
        questionElement.textContent = question.question;
        answersElement.innerHTML = "";

        const answers = [...question.incorrect_answers, question.correct_answer];
        answers.sort(() => Math.random() - 0.5);

        answers.forEach((answer) => {
            const li = document.createElement("li");
            li.textContent = answer;
            li.addEventListener("click", () => {
                if (answer === question.correct_answer) {
                    score++;
                }
                currentQuestionIndex++;
                displayQuestion();
            });
            answersElement.appendChild(li);
        });
    };

    const showResults = () => {
        triviaContainer.style.display = "none";
        resultsContainer.style.display = "block";
        const percentage = ((score / questions.length) * 100).toFixed(2);
        const correctAnswers = questions.map(
            (q) => `<p>Q: ${q.question}<br>Correct Answer: ${q.correct_answer}</p>`
        ).join("");

        resultsElement.innerHTML = `
            <p>Score: ${score}/${questions.length}</p>
            <p>Percentage: ${percentage}%</p>
            ${correctAnswers}
        `;
    };

    document.getElementById("backToTrivia").addEventListener("click", () => {
        window.location.href = "trivia.html";
    });

    fetchTrivia();
});
