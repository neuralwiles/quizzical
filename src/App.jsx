import { useState, useEffect } from "react";
import { decode } from "html-entities";
import { clsx } from "clsx";

export default function App() {
  // When I check the answers I need to:
  // Disable all radio buttons (maintaining selected state)
  // Check whether the answer that is selected is correct
  // Dynamically assign class names "correct" and "incorrect" to the labels based on whether the selected answer is correct

  const [startPage, setStartPage] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5")
      .then((res) => res.json())
      .then((data) =>
        setQuestions(
          data.results.map((question) => ({
            ...question,
            all_answers: question.incorrect_answers.toSpliced(
              Math.floor(
                Math.random() * (question.incorrect_answers.length + 1)
              ),
              0,
              question.correct_answer
            ),
            selected_answer: "",
          }))
        )
      );
  }, [startPage]);

  const questionElements = questions.map((question, questionIndex) => (
    <section key={questionIndex} className="question">
      <h2>{decode(question.question)}</h2>
      <div className="radio-buttons">
        {question.all_answers.map((answer, index) => (
          <div key={index}>
            <input
              type="radio"
              id={decode(answer) + index}
              name={decode(question.question)}
              checked={question.selected_answer === decode(answer)}
              disabled={showResults}
              onChange={() => selectAnswer(questionIndex, decode(answer))}
            ></input>
            <label
              className={clsx({
                incorrect:
                  showResults &&
                  question.selected_answer === decode(answer) &&
                  question.selected_answer != decode(question.correct_answer),
                correct:
                  showResults &&
                  decode(answer) === decode(question.correct_answer),
              })}
              htmlFor={decode(answer) + index}
            >
              {decode(answer)}
            </label>
          </div>
        ))}
      </div>
      <hr></hr>
    </section>
  ));

  function startQuiz() {
    setStartPage(false);
  }

  function selectAnswer(questionIndex, answer) {
    setQuestions((oldQuestions) =>
      oldQuestions.map((question, index) =>
        index === questionIndex
          ? { ...question, selected_answer: answer }
          : question
      )
    );
  }

  function checkAnswers() {
    setShowResults(true);
    setCorrectAnswers(
      questions
        .map(
          (question) =>
            question.selected_answer === decode(question.correct_answer)
        )
        .filter((answer) => answer === true).length
    );
  }

  function startNewGame() {
    setStartPage(true);
    setShowResults(false);
    setQuestions([]);
    setCorrectAnswers(0);
  }

  return startPage ? (
    <main>
      <h1>Quizzical</h1>
      <p>A short quiz game by Lauren</p>
      <button className="start-button" onClick={startQuiz}>
        Start Quiz
      </button>
    </main>
  ) : (
    questions && (
      <main>
        {questionElements}
        <div className="results-and-button">
          {showResults && (
            <h3>
              You scored {correctAnswers}/{questions.length} correct answers.
            </h3>
          )}
          <button onClick={showResults ? startNewGame : checkAnswers}>
            {showResults ? "Play Again" : "Check Answers"}
          </button>
        </div>
      </main>
    )
  );
}
