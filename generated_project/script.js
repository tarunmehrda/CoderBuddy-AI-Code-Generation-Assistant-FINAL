// Quiz Data
const quizData = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correct: 1
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2
    },
    {
        question: "What year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        question: "Which country is home to the kangaroo?",
        options: ["New Zealand", "Australia", "South Africa", "Brazil"],
        correct: 1
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct: 2
    }
];

// State
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let userAnswers = [];

// Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const reviewScreen = document.getElementById('review-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const retryBtn = document.getElementById('retry-btn');
const reviewBtn = document.getElementById('review-btn');
const backToResultsBtn = document.getElementById('back-to-results');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionNumber = document.getElementById('question-number');
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');

const scorePercentage = document.getElementById('score-percentage');
const scoreProgress = document.getElementById('score-progress');
const resultMessage = document.getElementById('result-message');
const resultDetails = document.getElementById('result-details');

const reviewContainer = document.getElementById('review-container');

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
retryBtn.addEventListener('click', resetQuiz);
reviewBtn.addEventListener('click', showReview);
backToResultsBtn.addEventListener('click', () => showScreen(resultsScreen));

// Functions
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    showScreen(quizScreen);
    loadQuestion();
}

function loadQuestion() {
    const question = quizData[currentQuestion];
    
    questionText.textContent = question.question;
    questionNumber.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    
    // Update progress bar
    const progress = ((currentQuestion) / quizData.length) * 100;
    progressBar.style.width = progress + '%';
    
    // Load options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionDiv);
    });
    
    nextBtn.disabled = true;
    startTimer();
}

function selectOption(selectedIndex) {
    const options = document.querySelectorAll('.option');
    const question = quizData[currentQuestion];
    
    // Disable all options
    options.forEach(opt => opt.classList.add('disabled'));
    
    // Clear timer
    clearInterval(timer);
    
    // Store user answer
    userAnswers[currentQuestion] = selectedIndex;
    
    // Show correct/incorrect
    options[selectedIndex].classList.add('selected');
    
    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        score++;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    nextBtn.disabled = false;
}

function startTimer() {
    timeLeft = 30;
    timerDisplay.textContent = timeLeft + 's';
    
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft + 's';
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Auto-select wrong answer if time runs out
            const question = quizData[currentQuestion];
            userAnswers[currentQuestion] = -1; // -1 means no answer
            
            const options = document.querySelectorAll('.option');
            options.forEach(opt => opt.classList.add('disabled'));
            options[question.correct].classList.add('correct');
            
            nextBtn.disabled = false;
        }
    }, 1000);
}

function nextQuestion() {
    clearInterval(timer);
    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    showScreen(resultsScreen);
    
    const percentage = Math.round((score / quizData.length) * 100);
    scorePercentage.textContent = percentage + '%';
    
    // Animate score circle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    scoreProgress.style.strokeDashoffset = offset;
    
    // Set result message
    if (percentage >= 80) {
        resultMessage.textContent = "Excellent! 🎉";
    } else if (percentage >= 60) {
        resultMessage.textContent = "Great Job! 👏";
    } else if (percentage >= 40) {
        resultMessage.textContent = "Good Effort! 👍";
    } else {
        resultMessage.textContent = "Keep Practicing! 💪";
    }
    
    resultDetails.textContent = `You got ${score} out of ${quizData.length} questions correct`;
}

function showReview() {
    showScreen(reviewScreen);
    reviewContainer.innerHTML = '';
    
    quizData.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let html = `
            <div class="review-question">
                ${index + 1}. ${question.question}
            </div>
        `;
        
        if (userAnswer === -1) {
            html += `
                <div class="review-answer your-answer">
                    <strong>Your Answer:</strong> No answer (Time expired)
                </div>
            `;
        } else {
            html += `
                <div class="review-answer your-answer">
                    <strong>Your Answer:</strong> ${question.options[userAnswer]}
                </div>
            `;
        }
        
        if (!isCorrect) {
            html += `
                <div class="review-answer correct-answer">
                    <strong>Correct Answer:</strong> ${question.options[question.correct]}
                </div>
            `;
        }
        
        reviewItem.innerHTML = html;
        reviewContainer.appendChild(reviewItem);
    });
}

function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    clearInterval(timer);
    showScreen(welcomeScreen);
}