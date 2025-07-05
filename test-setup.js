/**
 * Jest test setup file
 * Sets up the DOM environment for testing
 */

// Mock words.js functions
const WORDS = [
  "the",
  "of",
  "and",
  "a",
  "to",
  "in",
  "is",
  "you",
  "that",
  "it",
  "he",
  "was",
  "for",
  "on",
  "are",
  "as",
  "with",
  "his",
  "they",
  "i",
  "at",
  "be",
  "this",
  "have",
  "from",
  "or",
  "one",
  "had",
  "by",
  "word",
  "but",
  "not",
  "what",
  "all",
  "were",
  "we",
  "when",
  "your",
  "can",
  "said",
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateWords(count = 20) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(getRandomWord());
  }
  return words;
}

// Make functions available globally for tests
global.WORDS = WORDS;
global.getRandomWord = getRandomWord;
global.generateWords = generateWords;

// Mock DOM elements that are required for testing
const mockHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>TypeTest - WPM Typing Test</title>
</head>
<body>
    <header>
        <div class="header-content">
            <img src="assets/logo.png" alt="TypeTest Logo" class="logo">
            <h1 class="title">typetest</h1>
        </div>
    </header>
    <main>
        <section class="time-selector" id="timeSelector">
            <button class="time-option active" data-time="15">15</button>
            <button class="time-option" data-time="30">30</button>
            <button class="time-option active-default" data-time="60">60</button>
        </section>
        <section class="timer-display" id="timerDisplay" style="display: none;">
            <div class="countdown" id="countdown">60</div>
        </section>
        <section class="word-display-container">
            <div class="word-display" id="wordDisplay">
                <div class="caret" id="caret"></div>
                <div class="words-content" id="wordsContent"></div>
            </div>
        </section>
        <section class="controls">
            <button class="restart-btn" id="restartBtn">Restart (TAB)</button>
        </section>
        <section class="results" id="results" style="display: none;">
            <div class="wpm-display">
                <span class="wpm-number" id="wpmNumber">0</span>
                <span class="wpm-text">wpm</span>
            </div>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 TypeTest. All rights reserved.</p>
    </footer>
</body>
</html>
`;

// Set up DOM before each test
beforeEach(() => {
  document.body.innerHTML = mockHTML;

  // Mock getBoundingClientRect
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }));
});

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = "";
  jest.clearAllMocks();
});
