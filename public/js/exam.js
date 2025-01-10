document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("exam-settings");
    const questionsContainer = document.getElementById("questions-container");
    const questionsSection = document.getElementById("exam-questions");
    const submitButton = document.getElementById("submit-answers");
    const resultsSection = document.getElementById("results");
    const scoreDisplay = document.getElementById("score");

    let correctAnswers = 0;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const subject = document.getElementById("subject").value;
        const year = document.getElementById("year").value;
        const examType = document.getElementById("exam-type").value;
        const numQuestions = document.getElementById("num-questions").value;

        if (numQuestions < 1 || numQuestions > 40) {
            alert("Please select a number between 1 and 40.");
            return;
        }

        const questions = await fetchQuestions(subject, year, examType, numQuestions);
        renderQuestions(questions);
        questionsSection.classList.remove("hidden");
    });

    submitButton.addEventListener("click", () => {
        const answers = document.querySelectorAll(".answer");
        const userSelections = {};

        // Collect all user answers
        answers.forEach((answer) => {
            if (answer.checked) {
                const questionId = answer.name.split("-")[1];
                userSelections[questionId] = answer.value;
            }
        });

        const questionElements = document.querySelectorAll(".question");
        correctAnswers = 0;

        // Highlight answers and display correct ones
        questionElements.forEach((questionElement) => {
            const questionId = questionElement.dataset.id;
            const correctAnswer = questionElement.dataset.correctAnswer;

            const userAnswer = userSelections[questionId];

            if (userAnswer === correctAnswer) {
                correctAnswers++;
                questionElement.classList.add("correct");
            } else {
                questionElement.classList.add("incorrect");
            }

            // Show the correct answer if the user was wrong or skipped
            const correctAnswerElement = document.createElement("p");
            correctAnswerElement.textContent = `Correct Answer: ${correctAnswer.toUpperCase()} (${questionElement.dataset.correctText})`;
            correctAnswerElement.classList.add("correct-answer-highlight");
            questionElement.appendChild(correctAnswerElement);
        });

        resultsSection.classList.remove("hidden");
        scoreDisplay.textContent = `You got ${correctAnswers} out of ${questionElements.length} correct.`;
    });

    async function fetchQuestions(subject, year, examType, numQuestions) {
        const url = `https://questions.aloc.com.ng/api/v2/q/${numQuestions}?subject=${subject}&year=${year}&type=${examType}`;
        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "AccessToken": "ALOC-52c0b8e4400cae351679"
            },
        });
        const data = await response.json();
        return Array.isArray(data.data) ? data.data : [data.data]; // Ensure it's an array
    }

    function renderQuestions(questions) {
        questionsContainer.innerHTML = "";
        questions.forEach((q, index) => {
            const questionEl = document.createElement("div");
            questionEl.classList.add("question");
            questionEl.dataset.id = q.id;
            questionEl.dataset.correctAnswer = q.answer;
            questionEl.dataset.correctText = q.option[q.answer];

            const questionText = document.createElement("p");
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionEl.appendChild(questionText);

            for (const option in q.option) {
                if (q.option[option]) {
                    const label = document.createElement("label");
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = `question-${q.id}`;
                    input.value = option;
                    input.classList.add("answer");

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(q.option[option]));
                    questionEl.appendChild(label);
                }
            }

            questionsContainer.appendChild(questionEl);
        });

        submitButton.classList.remove("hidden");
    }
});
