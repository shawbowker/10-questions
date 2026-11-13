"use strict";

const startButton = document.querySelector("#start-quiz");
const questionArea = document.querySelector("#questions");
const infoArea = document.querySelector("#info");
const catOptionsMenu = document.querySelector("#selectedCategory");
const diffOptionsMenu = document.querySelector("#selectedDifficulty");
const resultsArea = document.querySelector("#results");

let count = 0;

// Create the back button
const backButton = document.createElement("button");
backButton.textContent = "Back";
backButton.id = "back-button";
infoArea.appendChild(backButton);
backButton.style.display = "none";
backButton.addEventListener("click", () => {
  goBack();
});

// Create the finish button
const finishButton = document.querySelector("#finish-quiz");
finishButton.style.display = "none";
finishButton.addEventListener("click", () => {
  finishQuiz();
});

// Decode the HTML so it doesn't show strange characters to the user
function decodeHTML(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

// Calls the API for the questions
const questionData = async function (event, id, difficulty) {
  const url = `https://opentdb.com/api.php?amount=10&category=${id}&difficulty=${difficulty}&type=multiple`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

// Calls the API to get the categories object
const getCategories = async function () {
  const url = "https://opentdb.com/api_category.php";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

//Creates the category options menu from the category object
let isCategoryClicked = false;

catOptionsMenu.addEventListener("click", async () => {
  if (isCategoryClicked) return;
  const categories = await getCategories();

  categories.trivia_categories.forEach((cat) => {
    const newCat = document.createElement("option");
    newCat.textContent = cat.name;
    newCat.value = cat.id;
    catOptionsMenu.appendChild(newCat);
  });
  isCategoryClicked = true;

  console.log(categories);
});

//Function that generates all the questions using the API call
const startQuiz = async (event, category, difficulty) => {
  try {
    count = 0;
    questionArea.innerHTML = "";

    const questions = await questionData(event, category, difficulty);
    startButton.style.display = "none";
    catOptionsMenu.style.display = "none";
    diffOptionsMenu.style.display = "none";

    questions.results.forEach((question, index) => {
      let allAnswers = question.incorrect_answers;
      const positionCorrect = Math.floor(Math.random() * 4);
      allAnswers.splice(positionCorrect, 0, question.correct_answer);

      const questionDiv = document.createElement("div");
      questionDiv.className = "question-full";
      questionArea.appendChild(questionDiv);

      const heading = document.createElement("h2");
      heading.id = `question-${index + 1}`;
      heading.textContent = decodeHTML(question.question);
      questionDiv.appendChild(heading);
      let answered = false;

      allAnswers.forEach((ans) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "question-option";
        questionDiv.appendChild(optionDiv);

        const guessButton = document.createElement("button");
        guessButton.className = "chosen-guess";

        guessButton.addEventListener("click", () => {
          if (answered) return;

          if (ans === question.correct_answer) {
            const correctAnswerCheckmark = document.createElement("span");
            correctAnswerCheckmark.textContent = "✅ Correct, well done!";
            optionDiv.appendChild(correctAnswerCheckmark);
            answered = true;
            count++;
            console.log("CORRECT");
          } else {
            const wrongAnswerCheckmark = document.createElement("span");
            wrongAnswerCheckmark.textContent = `❌ Wrong, the correct answer was ${decodeHTML(question.correct_answer)}`;
            optionDiv.appendChild(wrongAnswerCheckmark);
            answered = true;
            console.log("WRONG");
          }
        });

        const choice = document.createElement("p");
        choice.className = "displayed-choice";
        choice.textContent = decodeHTML(ans);
        optionDiv.appendChild(guessButton);
        optionDiv.appendChild(choice);
      });
    });

    backButton.style.display = "block";
    finishButton.style.display = "block";
    console.log(questions);
  } catch (err) {
    console.log(err.message);
    questionArea.textContent = "Something went wrong. Please try again.";
    backButton.style.display = "block";
    startButton.style.display = "none";
    catOptionsMenu.style.display = "none";
    diffOptionsMenu.style.display = "none";
  }
};

//Calls the function that generates the questions and passes through the chosen category
startButton.addEventListener("click", async (event) => {
  console.log(catOptionsMenu.value);
  const category = catOptionsMenu.value;

  const difficulty = diffOptionsMenu.value;

  await startQuiz(event, category, difficulty);
});

const finishQuiz = function () {
  questionArea.innerHTML = "";
  finishButton.style.display = "none";
  const finalScore = document.createElement("h3");
  const finalMessage = document.createElement("p");
  finalScore.textContent = count;
  finalScore.id = "final-score";
  finalMessage.id = "final-message";
  finalMessage.textContent = `You scored ${count} out of 10.`;
  resultsArea.appendChild(finalScore);
  resultsArea.appendChild(finalMessage);
};

const goBack = function () {
  questionArea.innerHTML = "";
  resultsArea.innerHTML = "";
  startButton.style.display = "block";
  catOptionsMenu.style.display = "block";
  diffOptionsMenu.style.display = "block";
  backButton.style.display = "none";
  finishButton.style.display = "none";
};
