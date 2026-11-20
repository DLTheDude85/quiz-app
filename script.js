/* =====================================================================
   "Are You Smarter Than a 5th Grader?" Quiz Game
   ---------------------------------------------------------------------
   How the game works:
   1. The player clicks Start and the question list is shuffled.
   2. One question at a time is shown with its answer buttons.
   3. When an answer is clicked, the buttons lock, the page background
      turns green (correct) or red (wrong), and the score updates.
   4. A "Next" button appears to move on. After the last question, a
      report card shows the final score, a letter grade, and a rating.
   ===================================================================== */

/* ---------- Grab the HTML elements we need to control (from index.html) ---------- */
const startButton = document.getElementById('start-btn')                       // "Start quiz" button
const nextButton = document.getElementById('next-btn')                         // "Next" / "See results" button
const restartButton = document.getElementById('restart-btn')                   // "Play again" button on the results screen
const introElement = document.getElementById('intro')                          // Screen 1: welcome text
const questionContainerElement = document.getElementById('question-container') // Screen 2: the quiz
const resultsElement = document.getElementById('results')                      // Screen 3: final score
const questionElement = document.getElementById('question')                    // Where the question text is displayed
const answerButtonsElement = document.getElementById('answer-buttons')         // Where the answer buttons are placed
const feedbackElement = document.getElementById('feedback')                    // "Correct!" / "Not quite..." message
const progressTextElement = document.getElementById('progress-text')           // "Question 3 of 32"
const progressBarElement = document.getElementById('progress-bar')             // The filling progress bar
const scoreElement = document.getElementById('score-text')                     // "Score: 2"
const totalQuestionsElement = document.getElementById('total-questions')       // Question count on the intro screen

/* ---------- "Back to games" link ----------
   CHANGE THIS to the address of your games page (for example '/games/' or
   'https://yoursite.com/games'). Every "Back to games" button in the
   game uses this one address. */
const GAMES_PAGE_URL = '../../games.html'
const backLinkTop = document.getElementById('back-link-top')                   // the link at the top of the card
document.querySelectorAll('.back-link').forEach(link => {
  link.href = GAMES_PAGE_URL                                                   // point every Back to games link at the address above
})

/* ---------- Game state ---------- */
// shuffledQuestions: the questions in random order for the current game
// currentQuestionIndex: which question (by position in that shuffled list) we are on
// score: how many questions the player has answered correctly so far
let shuffledQuestions, currentQuestionIndex, score

/* ---------- Final ratings ----------
   After the last question, the player's percentage is compared to this
   list from top to bottom. The FIRST rating whose "min" they reach is
   the one shown. Edit the wording or the cutoffs here. */
const ratings = [
  { min: 90, grade: 'A', title: 'Way smarter than a 5th grader!', message: 'Top of the class. Your teachers would be proud.' },
  { min: 75, grade: 'B', title: 'Smarter than a 5th grader!', message: 'Nice work. You know your stuff.' },
  { min: 60, grade: 'C', title: 'About as smart as a 5th grader.', message: 'Solid effort. A little more studying and you’ll pull ahead.' },
  { min: 40, grade: 'D', title: 'The 5th grader has the edge.', message: 'It was a close race. Try again and see if you can catch up.' },
  { min: 0,  grade: 'F', title: 'Back to 5th grade for you!', message: 'Every expert started somewhere. Play again!' }
]

/* ---------- Button click listeners ---------- */
// Clicking Start (or Play again) begins a new game
startButton.addEventListener('click', startGame)
restartButton.addEventListener('click', startGame)

// Clicking Next moves to the following question, or to the results after the last one
nextButton.addEventListener('click', () => {
  currentQuestionIndex++   // advance to the next question in the list
  if (currentQuestionIndex < shuffledQuestions.length) {
    setNextQuestion()      // there is another question, so display it
  } else {
    showResults()          // that was the last one, so show the report card
  }
})

/* ---------------------------------------------------------------------
   shuffleArray
   Returns a randomly shuffled COPY of an array, using the Fisher-Yates
   method, which gives every possible order an equal chance. (The old
   sort(() => Math.random() - .5) trick favors some orders over others.)
   The original array is left untouched.
   --------------------------------------------------------------------- */
function shuffleArray(array) {
  const copy = array.slice()                               // work on a copy, not the original
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))          // pick a random position from 0 up to i
    ;[copy[i], copy[j]] = [copy[j], copy[i]]               // swap the two items
  }
  return copy
}

/* ---------------------------------------------------------------------
   startGame
   Runs when Start/Play again is clicked. Resets the game and shows the
   first question.
   --------------------------------------------------------------------- */
function startGame() {
  introElement.classList.add('hide')                       // hide the intro screen
  resultsElement.classList.add('hide')                     // hide the results screen (when playing again)
  backLinkTop.classList.remove('hide')                     // show the top Back to games link again
  shuffledQuestions = shuffleArray(questions)              // put questions in random order
  currentQuestionIndex = 0                                 // begin at the first question
  score = 0                                                // reset the score
  updateScore()
  questionContainerElement.classList.remove('hide')        // reveal the question area
  setNextQuestion()                                        // show the first question
}

/* ---------------------------------------------------------------------
   setNextQuestion
   Clears the previous question's buttons/colors, then displays the
   current question and updates the progress display.
   --------------------------------------------------------------------- */
function setNextQuestion() {
  resetState()
  showQuestion(shuffledQuestions[currentQuestionIndex])
  // Update the "Question 3 of 32" text and the progress bar (fills as questions are completed)
  progressTextElement.textContent = `Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}`
  progressBarElement.style.width = `${(currentQuestionIndex / shuffledQuestions.length) * 100}%`
  questionElement.focus()   // move keyboard/screen reader focus to the new question
}

/* ---------------------------------------------------------------------
   showQuestion
   Puts the question text on the page and builds one button for each
   possible answer.
   --------------------------------------------------------------------- */
function showQuestion(question) {
  // textContent is used (instead of innerText) because it is faster and safer for plain text
  questionElement.textContent = question.question

  // Shuffle the answer order, unless the question says keepOrder: true
  // (used for True/False and number answers, which read better in a set order)
  const answers = question.keepOrder ? question.answers : shuffleArray(question.answers)

  answers.forEach((answer, index) => {                      // loop through every answer choice
    const button = document.createElement('button')        // create a new button
    button.type = 'button'
    button.classList.add('btn', 'answer-btn')               // apply the button styling from styles.css

    // Small circle on the left showing the letter A, B, C, D...
    const marker = document.createElement('span')
    marker.classList.add('answer-marker')
    marker.textContent = String.fromCharCode(65 + index)    // 65 is the character code for "A"
    marker.setAttribute('aria-hidden', 'true')              // screen readers skip it and read the answer text

    // The answer text itself
    const label = document.createElement('span')
    label.textContent = answer.text

    button.append(marker, label)
    if (answer.correct) {
      // Mark the correct answer by storing it on the button (data-correct="true").
      // Wrong answers get no data attribute at all.
      button.dataset.correct = answer.correct
    }
    button.addEventListener('click', selectAnswer)          // run selectAnswer when clicked
    answerButtonsElement.appendChild(button)                // add the button to the page
  })
}

/* ---------------------------------------------------------------------
   resetState
   Cleans up the screen before each new question: removes the
   green/red background, hides the Next button, clears the feedback
   message, and deletes the old answer buttons.
   --------------------------------------------------------------------- */
function resetState() {
  clearStatusClass(document.body)          // remove the green/red page background
  clearStatusClass(feedbackElement)        // remove the green/red feedback text color
  feedbackElement.textContent = ''         // clear the feedback message
  nextButton.classList.add('hide')         // hide Next until an answer is picked
  // Remove every old answer button, one at a time, until none are left
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
}

/* ---------------------------------------------------------------------
   selectAnswer
   Runs when the player clicks an answer. Locks the buttons so the
   answer can't be changed, shows whether they were right, updates the
   score, and reveals the Next button.
   --------------------------------------------------------------------- */
function selectAnswer(e) {
  // currentTarget is the button itself (e.target could be the text or circle inside it)
  const selectedButton = e.currentTarget
  const isCorrect = selectedButton.dataset.correct === 'true'

  if (isCorrect) {
    score++                                          // one point for a right answer
    updateScore()
  }

  setStatusClass(document.body, isCorrect)           // turn the page background green or red

  // Go through every answer button and lock it / color it
  Array.from(answerButtonsElement.children).forEach(button => {
    button.disabled = true                           // LOCK: no more clicks on this question
    const marker = button.querySelector('.answer-marker')
    if (button.dataset.correct) {
      setStatusClass(button, true)                   // the correct answer turns green...
      marker.textContent = '✓'                       // ...and shows a check mark
    } else if (button === selectedButton) {
      setStatusClass(button, false)                  // the player's wrong pick turns red...
      marker.textContent = '✕'                       // ...and shows an X
    } else {
      button.classList.add('dimmed')                 // all other answers fade out
    }
  })

  // Show a message under the answers. If wrong, reveal the right answer.
  const correctText = answerButtonsElement.querySelector('[data-correct] span:last-child').textContent
  setStatusClass(feedbackElement, isCorrect)
  feedbackElement.textContent = isCorrect
    ? 'Correct! Nice one.'
    : `Not quite. The answer is ${correctText}.`

  // Fill the progress bar to include the question that was just answered
  progressBarElement.style.width = `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`

  // Show the Next button. On the last question it says "See results" instead.
  const isLastQuestion = currentQuestionIndex + 1 === shuffledQuestions.length
  nextButton.textContent = isLastQuestion ? 'See results' : 'Next'
  nextButton.classList.remove('hide')
  nextButton.focus()   // so keyboard users can just press Enter to continue
}

/* ---------------------------------------------------------------------
   updateScore
   Refreshes the "Score: X" text above the question.
   --------------------------------------------------------------------- */
function updateScore() {
  scoreElement.textContent = `Score: ${score}`
}

/* ---------------------------------------------------------------------
   showResults
   Hides the quiz and shows the final report card: score, percentage,
   letter grade, and a rating from the "ratings" list at the top.
   --------------------------------------------------------------------- */
function showResults() {
  const total = shuffledQuestions.length
  const percent = Math.round((score / total) * 100)
  const rating = ratings.find(r => percent >= r.min)    // first rating the player's percentage qualifies for

  clearStatusClass(document.body)                       // return the page background to blue
  questionContainerElement.classList.add('hide')        // hide the quiz
  resultsElement.classList.remove('hide')               // show the report card
  backLinkTop.classList.add('hide')                     // the results screen has its own Back to games button

  document.getElementById('final-score').textContent = `${score} / ${total}`
  document.getElementById('final-percent').textContent = `${percent}%`
  document.getElementById('rating-grade').textContent = rating.grade
  document.getElementById('rating-title').textContent = rating.title
  document.getElementById('rating-message').textContent = rating.message

  document.getElementById('results-heading').focus()    // move keyboard/screen reader focus to the results
}

/* ---------------------------------------------------------------------
   setStatusClass
   Marks an element as "correct" (green) or "wrong" (red) by adding the
   matching CSS class. Any old status is removed first.
   --------------------------------------------------------------------- */
function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
    element.classList.add('correct')
  } else {
    element.classList.add('wrong')
  }
}

/* ---------------------------------------------------------------------
   clearStatusClass
   Removes both the "correct" and "wrong" classes from an element so it
   goes back to its normal look.
   --------------------------------------------------------------------- */
function clearStatusClass(element) {
  element.classList.remove('correct')
  element.classList.remove('wrong')
}

/* =====================================================================
   QUESTIONS
   ---------------------------------------------------------------------
   Each question has this format:
     {
       question: 'The question text',
       keepOrder: true,          // OPTIONAL - see below
       answers: [
         { text: 'Answer choice', correct: true },   // exactly ONE answer must be true
         { text: 'Another choice', correct: false }
       ]
     }
   keepOrder: By default the answers are shuffled each time. Add
   "keepOrder: true" to show them in the order written (good for
   True/False and for number answers listed smallest to largest).

   To add a new question, copy one of the blocks below, paste it at the
   end of the list (before the closing bracket), and edit the text.
   Don't forget the comma between questions!
   ===================================================================== */
const questions = [
  /* ---------- Original questions ---------- */
  {
    // NOTE: The original had 'True' marked correct, but 200°F is about 93°C,
    // which is cooler than 100°C (water boils at 212°F). Corrected to 'False'.
    question: '200 degrees Fahrenheit is warmer than 100 degrees Centigrade. True or False?',
    keepOrder: true,
    answers: [
      { text: 'True', correct: false },
      { text: 'False', correct: true }
    ]
  },
  {
    question: 'What is the capital of France?',
    answers: [
      { text: 'Paris', correct: true },
      { text: 'London', correct: false },
      { text: 'Rome', correct: false },
      { text: 'Madrid', correct: false }
    ]
  },
  {
    question: 'What is the largest organ in the human body?',
    answers: [
      { text: 'Brain', correct: false },
      { text: 'Skin', correct: true },
      { text: 'Liver', correct: false },
      { text: 'Heart', correct: false }
    ]
  },
  {
    question: 'How many continents are there in the world?',
    keepOrder: true,
    answers: [
      { text: '5', correct: false },
      { text: '6', correct: false },
      { text: '7', correct: true },
      { text: '8', correct: false }
    ]
  },
  {
    question: 'Which is greater? 15/2 or 40/6',   // 15/2 = 7.5 and 40/6 = about 6.67
    keepOrder: true,
    answers: [
      { text: '15/2', correct: true },
      { text: '40/6', correct: false }
    ]
  },
  {
    question: '108 divided by 12 is equal to 9. Which number is the quotient?',
    keepOrder: true,
    answers: [
      { text: '9', correct: true },
      { text: '12', correct: false },
      { text: '108', correct: false }
    ]
  },
  {
    question: 'Which of the following is a primary color?',
    answers: [
      { text: 'Green', correct: false },
      { text: 'Orange', correct: false },
      { text: 'Yellow', correct: true },
      { text: 'Purple', correct: false }
    ]
  },

  /* ---------- Added questions ---------- */
  {
    question: 'How many sides does a hexagon have?',
    keepOrder: true,
    answers: [
      { text: '5', correct: false },
      { text: '6', correct: true },
      { text: '7', correct: false },
      { text: '8', correct: false }
    ]
  },
  {
    question: 'Which planet is known as the Red Planet?',
    answers: [
      { text: 'Venus', correct: false },
      { text: 'Jupiter', correct: false },
      { text: 'Mars', correct: true },
      { text: 'Saturn', correct: false }
    ]
  },
  {
    question: 'What is 7 x 8?',
    keepOrder: true,
    answers: [
      { text: '48', correct: false },
      { text: '54', correct: false },
      { text: '56', correct: true },
      { text: '63', correct: false }
    ]
  },
  {
    question: 'Which gas do plants take in from the air to make their food (photosynthesis)?',
    answers: [
      { text: 'Carbon dioxide', correct: true },
      { text: 'Oxygen', correct: false },
      { text: 'Nitrogen', correct: false },
      { text: 'Hydrogen', correct: false }
    ]
  },
  {
    question: 'Who was the first President of the United States?',
    answers: [
      { text: 'Thomas Jefferson', correct: false },
      { text: 'George Washington', correct: true },
      { text: 'Abraham Lincoln', correct: false },
      { text: 'John Adams', correct: false }
    ]
  },
  {
    question: 'What is the largest ocean on Earth?',
    answers: [
      { text: 'Atlantic Ocean', correct: false },
      { text: 'Indian Ocean', correct: false },
      { text: 'Arctic Ocean', correct: false },
      { text: 'Pacific Ocean', correct: true }
    ]
  },
  {
    question: 'What is 3/4 written as a decimal?',
    keepOrder: true,
    answers: [
      { text: '0.34', correct: false },
      { text: '0.43', correct: false },
      { text: '0.75', correct: true },
      { text: '1.34', correct: false }
    ]
  },
  {
    question: 'A noun is a word that names a person, place, or thing. True or False?',
    keepOrder: true,
    answers: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]
  },
  {
    question: 'Which of these animals is a mammal?',
    answers: [
      { text: 'Shark', correct: false },
      { text: 'Salmon', correct: false },
      { text: 'Dolphin', correct: true },
      { text: 'Octopus', correct: false }
    ]
  },
  {
    question: 'How many days are in a leap year?',
    keepOrder: true,
    answers: [
      { text: '364', correct: false },
      { text: '365', correct: false },
      { text: '366', correct: true },
      { text: '367', correct: false }
    ]
  },
  {
    question: 'At what temperature does water boil in degrees Celsius?',
    keepOrder: true,
    answers: [
      { text: '90', correct: false },
      { text: '100', correct: true },
      { text: '110', correct: false },
      { text: '212', correct: false }
    ]
  },
  {
    question: 'Which word means almost the same thing as "happy"?',
    answers: [
      { text: 'Joyful', correct: true },
      { text: 'Gloomy', correct: false },
      { text: 'Angry', correct: false },
      { text: 'Tired', correct: false }
    ]
  },
  {
    question: 'What is the perimeter of a rectangle that is 5 units long and 3 units wide?',
    keepOrder: true,
    answers: [
      { text: '8 units', correct: false },
      { text: '15 units', correct: false },
      { text: '16 units', correct: true },
      { text: '30 units', correct: false }
    ]
  },
  {
    question: 'Which layer of the Earth do we live on?',
    answers: [
      { text: 'Mantle', correct: false },
      { text: 'Outer core', correct: false },
      { text: 'Inner core', correct: false },
      { text: 'Crust', correct: true }
    ]
  },
  {
    question: 'What is the past tense of the word "run"?',
    answers: [
      { text: 'Runned', correct: false },
      { text: 'Ran', correct: true },
      { text: 'Running', correct: false },
      { text: 'Runs', correct: false }
    ]
  },
  {
    question: 'Which U.S. state is the largest by area?',
    answers: [
      { text: 'Texas', correct: false },
      { text: 'California', correct: false },
      { text: 'Alaska', correct: true },
      { text: 'Montana', correct: false }
    ]
  },
  {
    question: 'What force pulls objects toward the Earth?',
    answers: [
      { text: 'Gravity', correct: true },
      { text: 'Magnetism', correct: false },
      { text: 'Friction', correct: false },
      { text: 'Wind', correct: false }
    ]
  },
  {
    question: 'What is 25% of 80?',
    keepOrder: true,
    answers: [
      { text: '15', correct: false },
      { text: '20', correct: true },
      { text: '25', correct: false },
      { text: '40', correct: false }
    ]
  },
  {
    question: 'Which of these numbers is a prime number?',
    keepOrder: true,
    answers: [
      { text: '9', correct: false },
      { text: '15', correct: false },
      { text: '17', correct: true },
      { text: '21', correct: false }
    ]
  },
  {
    question: 'What is it called when liquid water changes into a gas (water vapor)?',
    answers: [
      { text: 'Condensation', correct: false },
      { text: 'Evaporation', correct: true },
      { text: 'Precipitation', correct: false },
      { text: 'Freezing', correct: false }
    ]
  },
  {
    question: 'How many bones are in the adult human body?',
    keepOrder: true,
    answers: [
      { text: '106', correct: false },
      { text: '206', correct: true },
      { text: '306', correct: false },
      { text: '406', correct: false }
    ]
  },
  {
    question: 'Which word is spelled correctly?',
    answers: [
      { text: 'Neccessary', correct: false },
      { text: 'Necesary', correct: false },
      { text: 'Neccesary', correct: false },
      { text: 'Necessary', correct: true }
    ]
  },
  {
    question: 'What is the capital city of Canada?',
    answers: [
      { text: 'Toronto', correct: false },
      { text: 'Vancouver', correct: false },
      { text: 'Ottawa', correct: true },
      { text: 'Montreal', correct: false }
    ]
  },
  {
    question: 'Sound travels faster through air than it does through water. True or False?',
    keepOrder: true,
    answers: [
      { text: 'True', correct: false },
      { text: 'False', correct: true }   // Sound moves about 4x faster through water
    ]
  },
  {
    question: 'Which famous U.S. document begins with the words "We the People"?',
    answers: [
      { text: 'The Declaration of Independence', correct: false },
      { text: 'The Constitution', correct: true },
      { text: 'The Bill of Rights', correct: false },
      { text: 'The Gettysburg Address', correct: false }
    ]
  }
]

/* ---------------------------------------------------------------------
   Show how many questions there are on the intro screen. It updates
   automatically if you add or remove questions. (This line must stay
   BELOW the questions list, because the list has to exist first.)
   --------------------------------------------------------------------- */
totalQuestionsElement.textContent = questions.length
