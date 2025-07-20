/**
 * WPM Typing Test Application
 * Main JavaScript file for handling typing test functionality
 */

// Global state
const testState = {
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  displayStartIndex: 0,
  isTestActive: false,
  timeRemaining: 60,
  testDuration: 60,
  timer: null,
  keystrokes: 0,
  correctKeystrokes: 0,
  lastInputTime: 0,
  inputThrottleDelay: 50,
  caretBlinkTimeout: null,
  isTyping: false
};

// DOM elements
const elements = {
  timeSelector: document.getElementById("timeSelector"),
  timerDisplay: document.getElementById("timerDisplay"),
  countdown: document.getElementById("countdown"),
  wordDisplay: document.getElementById("wordDisplay"),
  wordsContent: document.getElementById("wordsContent"),
  caret: document.getElementById("caret"),
  restartBtn: document.getElementById("restartBtn"),
  results: document.getElementById("results"),
  wpmNumber: document.getElementById("wpmNumber"),
};

/**
 * Initialize the application
 */
function initializeApp() {
  // Generate initial words
  generateTestWords();

  // Render words
  renderWords();

  // Setup event listeners
  setupEventListeners();

  // Start caret blinking initially
  startCaretBlinking();
}

/**
 * Generate random words for the test
 */
function generateTestWords() {
  testState.words = generateWords(200); // Generate enough words for the test
  testState.displayStartIndex = 0;
  testState.linesGenerated = 0;
  renderWords();
}

/**
 * Generate additional words when needed
 */
function generateMoreWords() {
  const additionalWords = generateWords(50);
  testState.words.push(...additionalWords);
}

/**
 * Render words in the display area
 */
function renderWords() {
  if (!elements.wordsContent) {
    console.warn("wordsContent element not found");
    return;
  }

  elements.wordsContent.innerHTML = "";

  // Display words starting from displayStartIndex, showing about 35 words to ensure two lines
  const endIndex = Math.min(
    testState.displayStartIndex + 35,
    testState.words.length,
  );
  const wordsToDisplay = testState.words.slice(
    testState.displayStartIndex,
    endIndex,
  );

  wordsToDisplay.forEach((word, relativeIndex) => {
    const absoluteWordIndex = testState.displayStartIndex + relativeIndex;
    const wordElement = document.createElement("span");
    wordElement.className = "word";
    wordElement.setAttribute("data-word-index", absoluteWordIndex);

    // Add current word highlighting
    if (absoluteWordIndex === testState.currentWordIndex) {
      wordElement.classList.add("current");
    } else if (absoluteWordIndex < testState.currentWordIndex) {
      wordElement.classList.add("completed");
    }

    // Create span for each character
    for (let i = 0; i < word.length; i++) {
      const charElement = document.createElement("span");
      charElement.className = "char";
      charElement.textContent = word[i];
      charElement.setAttribute("data-char-index", i);
      charElement.setAttribute("data-word-index", absoluteWordIndex);
      wordElement.appendChild(charElement);
    }

    // Add space after word (except last word)
    if (relativeIndex < wordsToDisplay.length - 1) {
      const spaceElement = document.createElement("span");
      spaceElement.className = "char space";
      spaceElement.textContent = " ";
      spaceElement.setAttribute("data-char-index", word.length);
      spaceElement.setAttribute("data-word-index", absoluteWordIndex);
      wordElement.appendChild(spaceElement);
    }

    elements.wordsContent.appendChild(wordElement);
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Time selector buttons
  const timeOptions = document.querySelectorAll(".time-option");
  timeOptions.forEach((option) => {
    option.addEventListener("click", handleTimeSelection);
  });

  // Restart button
  elements.restartBtn.addEventListener("click", restartTest);

  // Keyboard events
  document.addEventListener("keydown", handleKeyPress);

  // Tab key for restart
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      restartTest();
    }
  });

  // Window resize event to recalculate caret position
  window.addEventListener("resize", handleWindowResize);
}

/**
 * Handle window resize event
 */
function handleWindowResize() {
  // Debounce resize events to avoid excessive calculations
  clearTimeout(handleWindowResize.timeout);
  handleWindowResize.timeout = setTimeout(() => {
    if (testState.isTestActive) {
      updateCaretPosition();
    }
  }, 100);
}

/**
 * Handle time selection
 * @param {Event} event - Click event
 */
function handleTimeSelection(event) {
  const selectedTime = parseInt(event.target.dataset.time);
  testState.testDuration = selectedTime;
  testState.timeRemaining = selectedTime;

  // Update UI
  document.querySelectorAll(".time-option").forEach((option) => {
    option.classList.remove("active", "active-default");
  });
  event.target.classList.add("active");

  // Update countdown display
  elements.countdown.textContent = selectedTime;
}

/**
 * Handle keyboard input
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyPress(event) {
  // Throttle rapid input to prevent performance issues
  const currentTime = Date.now();
  if (
    testState.isTestActive &&
    currentTime - testState.lastInputTime < testState.inputThrottleDelay
  ) {
    event.preventDefault();
    return;
  }

  // Check if this is a control key combination (Ctrl, Alt, Meta, etc.)
  if (event.ctrlKey || event.altKey || event.metaKey) {
    // Allow control key combinations to work normally
    return;
  }

  // Only handle typing characters and backspace
  if (event.key === "Backspace") {
    event.preventDefault();
    if (testState.isTestActive) {
      handleBackspace();
    }
    return;
  }

  // Check if this is a valid typing character (letters, numbers, punctuation, space)
  const isValidTypingChar = event.key.length === 1 && 
    (event.key.match(/[a-zA-Z0-9\s.,!?;:'"()-]/) || event.key === ' ');

  if (isValidTypingChar) {
    event.preventDefault();
    
    // Start test on first valid character input
    if (!testState.isTestActive) {
      startTest();
    }
    
    // Update last input time
    testState.lastInputTime = currentTime;
    
    // Handle the character input
    handleCharacterInput(event.key);
  }
}

/**
 * Start the typing test
 */
function startTest() {
  testState.isTestActive = true;

  // Hide time selector and show timer
  elements.timeSelector.style.display = "none";
  elements.timerDisplay.style.display = "block";

  // Start countdown timer
  testState.timer = setInterval(() => {
    testState.timeRemaining--;
    elements.countdown.textContent = testState.timeRemaining;

    if (testState.timeRemaining <= 0) {
      endTest();
    }
  }, 1000);
}

/**
 * Handle character input
 * @param {string} char - Input character
 */
function handleCharacterInput(char) {
  if (!testState.isTestActive) return;

  // Handle typing for caret blinking
  handleTyping();

  const currentWord = testState.words[testState.currentWordIndex];
  const currentChar = getCurrentChar();

  if (!currentChar) return;

  // Check if character is correct
  if (char === currentChar.textContent) {
    currentChar.classList.add("correct");
    testState.correctKeystrokes++;
  } else {
    currentChar.classList.add("incorrect");
  }

  // Store current word index before moving
  const previousWordIndex = testState.currentWordIndex;

  // Move to next character
  moveToNextChar();
  
  // Only update word highlighting if we moved to a new word
  if (testState.currentWordIndex !== previousWordIndex) {
    updateWordHighlighting();
  }
}

/**
 * Handle backspace input
 */
function handleBackspace() {
  if (!testState.isTestActive) return;

  // Handle typing for caret blinking
  handleTyping();

  // Don't allow backspace if at the very beginning
  if (testState.currentWordIndex === 0 && testState.currentCharIndex === 0) {
    return;
  }

  moveToPrevChar();
  updateWordHighlighting();
}

/**
 * Get current character element
 * @returns {HTMLElement|null} Current character element
 */
function getCurrentChar() {
  // Find the word element by its data-word-index attribute
  const wordElement = elements.wordsContent.querySelector(
    `[data-word-index="${testState.currentWordIndex}"]`,
  );
  if (!wordElement) return null;

  const charElement = wordElement.children[testState.currentCharIndex];
  return charElement || null;
}

/**
 * Move to next character
 */
function moveToNextChar() {
  const currentWord = testState.words[testState.currentWordIndex];

  // Check if we're at the end of current word (including space)
  if (testState.currentCharIndex >= currentWord.length) {
    // Move to next word
    testState.currentWordIndex++;
    testState.currentCharIndex = 0;

    // Check if we need to generate more words
    if (testState.currentWordIndex >= testState.words.length - 20) {
      generateMoreWords();
    }

    // Check if we need to scroll to the next line
    checkAndHandleLineScrolling();
  } else {
    testState.currentCharIndex++;
  }

  updateCaretPosition();
}

/**
 * Update word highlighting based on current position
 */
function updateWordHighlighting() {
  // Remove all current highlighting
  const allWords = elements.wordsContent.querySelectorAll(".word");
  allWords.forEach(word => {
    word.classList.remove("current", "completed");
  });

  // Add highlighting based on current position
  allWords.forEach(word => {
    const wordIndex = parseInt(word.getAttribute("data-word-index"));
    if (wordIndex === testState.currentWordIndex) {
      word.classList.add("current");
    } else if (wordIndex < testState.currentWordIndex) {
      word.classList.add("completed");
    }
  });
}

/**
 * Check if line scrolling is needed and handle it
 */
function checkAndHandleLineScrolling() {
  if (!testState.isTestActive) return;

  const currentChar = getCurrentChar();
  if (!currentChar) return;

  const containerRect = elements.wordDisplay.getBoundingClientRect();
  const charRect = currentChar.getBoundingClientRect();

  // Get the height of the container minus padding (2 lines max)
  const containerHeight = elements.wordDisplay.clientHeight - 40; // Account for padding
  const lineHeight = parseFloat(
    getComputedStyle(elements.wordsContent).lineHeight,
  );

  // Check if we're beyond the visible area (need to scroll)
  const charTopRelative = charRect.top - containerRect.top;

  // Trigger scroll when we're about to go beyond the second line
  if (charTopRelative > containerHeight - lineHeight * 0.5) {
    handleLineScrolling();
  }
}

/**
 * Handle line scrolling animation
 */
function handleLineScrolling() {
  // Find the word index at the start of the second line
  const words = elements.wordsContent.children;
  let secondLineStartIndex = 0;

  if (words.length > 0) {
    const firstLineTop = words[0].getBoundingClientRect().top;

    for (let i = 1; i < words.length; i++) {
      const wordTop = words[i].getBoundingClientRect().top;
      if (wordTop > firstLineTop + 10) {
        // 10px tolerance
        const wordIndex = parseInt(words[i].getAttribute("data-word-index"));
        secondLineStartIndex = wordIndex;
        break;
      }
    }
  }

  if (secondLineStartIndex > testState.displayStartIndex) {
    // Animate scrolling to new position
    animateLineScroll(secondLineStartIndex);
  }
}

/**
 * Animate line scrolling
 * @param {number} newStartIndex - New starting word index to display
 */
function animateLineScroll(newStartIndex) {
  const wordsContent = elements.wordsContent;

  // Add transition class for smooth animation
  wordsContent.style.transition = "transform 0.3s ease-out";
  wordsContent.style.transform = "translateY(-1.5em)";

  // Use requestAnimationFrame for smoother animation
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Update display start index and re-render
      testState.displayStartIndex = newStartIndex;
      testState.linesGenerated++;

      // Re-render words with new starting position
      renderWords();

      // Reset transform and remove transition
      wordsContent.style.transform = "translateY(0)";

      requestAnimationFrame(() => {
        setTimeout(() => {
          wordsContent.style.transition = "";
        }, 300);
      });

      // Update caret position after re-render
      updateCaretPosition();
    }, 300);
  });
}

/**
 * Move to previous character
 */
function moveToPrevChar() {
  // Prevent going beyond the start of the test
  if (testState.currentWordIndex === 0 && testState.currentCharIndex === 0) {
    return;
  }

  if (testState.currentCharIndex > 0) {
    testState.currentCharIndex--;
  } else if (testState.currentWordIndex > 0) {
    testState.currentWordIndex--;
    testState.currentCharIndex =
      testState.words[testState.currentWordIndex].length;
  }

  // Reset character styling
  const currentChar = getCurrentChar();
  if (currentChar) {
    currentChar.classList.remove("correct", "incorrect");
  }

  updateCaretPosition();
}

/**
 * Update caret position
 */
function updateCaretPosition() {
  if (!elements.caret || !elements.wordDisplay) {
    return;
  }

  try {
    const currentChar = getCurrentChar();
    if (!currentChar) {
      // Position at start of first character if no current char
      const firstChar = elements.wordsContent.querySelector(".char");
      if (firstChar) {
        const rect = firstChar.getBoundingClientRect();
        const containerRect = elements.wordDisplay.getBoundingClientRect();
        elements.caret.style.left = (rect.left - containerRect.left - 1) + "px";
        elements.caret.style.top = (rect.top - containerRect.top + (rect.height - 32) / 2) + "px";
      }
      return;
    }

    const rect = currentChar.getBoundingClientRect();
    const containerRect = elements.wordDisplay.getBoundingClientRect();

    // Position caret at the beginning of the current character with precise alignment
    elements.caret.style.left = (rect.left - containerRect.left - 1) + "px";
    elements.caret.style.top = (rect.top - containerRect.top + (rect.height - 32) / 2) + "px";
    elements.caret.style.height = "32px";
  } catch (error) {
    console.warn("Error updating caret position:", error);
    // Fallback: position caret at start
    elements.caret.style.left = "25px";
    elements.caret.style.top = "34px";
  }
}

/**
 * End the typing test
 */
function endTest() {
  testState.isTestActive = false;

  // Clear timer
  if (testState.timer) {
    clearInterval(testState.timer);
    testState.timer = null;
  }

  // Calculate WPM - adjust for different time durations
  let wpm = Math.round(testState.correctKeystrokes / 5);
  
  // Adjust WPM based on test duration
  if (testState.testDuration === 15) {
    wpm = wpm * 4; // 15 seconds * 4 = 60 seconds
  } else if (testState.testDuration === 30) {
    wpm = wpm * 2; // 30 seconds * 2 = 60 seconds
  }
  // 60 seconds is already correct (multiply by 1)

  // Smoothly fade out the typing interface
  elements.timerDisplay.classList.add("fade-out");
  elements.wordDisplay.parentElement.classList.add("fade-out"); // word-display-container
  document.querySelector(".controls").classList.add("fade-out");

  // After fade out completes, show results with fade in
  setTimeout(() => {
    // Hide typing interface elements
    elements.timerDisplay.style.display = "none";
    elements.wordDisplay.parentElement.style.display = "none";
    document.querySelector(".controls").style.display = "none";

    // Show results and set WPM
    elements.results.style.display = "block";
    elements.wpmNumber.textContent = wpm;

    // Show restart button on results screen
    const resultsRestartBtn = document.createElement("button");
    resultsRestartBtn.className = "restart-btn";
    resultsRestartBtn.textContent = "Restart (TAB)";
    resultsRestartBtn.addEventListener("click", restartTest);
    
    // Insert restart button after the WPM display
    const wpmDisplay = elements.results.querySelector(".wpm-display");
    wpmDisplay.parentNode.insertBefore(resultsRestartBtn, wpmDisplay.nextSibling);

    // Fade in results after a brief delay
    setTimeout(() => {
      elements.results.classList.add("show");
    }, 50);
  }, 400); // Wait for fade out to complete
}

/**
 * Restart the typing test
 */
function restartTest() {
  // Reset state
  testState.isTestActive = false;
  testState.timeRemaining = testState.testDuration;
  testState.currentWordIndex = 0;
  testState.currentCharIndex = 0;
  testState.correctKeystrokes = 0;
  testState.displayStartIndex = 0;
  testState.linesGenerated = 0;
  testState.lastInputTime = 0;

  // Clear timer
  if (testState.timer) {
    clearInterval(testState.timer);
    testState.timer = null;
  }

  // Clear any pending timeouts
  if (handleWindowResize.timeout) {
    clearTimeout(handleWindowResize.timeout);
  }

  // Reset UI and remove fade classes
  elements.timeSelector.style.display = "flex";
  elements.timerDisplay.style.display = "none";
  elements.timerDisplay.classList.remove("fade-out");
  elements.wordDisplay.parentElement.style.display = "block";
  elements.wordDisplay.parentElement.classList.remove("fade-out");
  document.querySelector(".controls").style.display = "block";
  document.querySelector(".controls").classList.remove("fade-out");
  elements.results.style.display = "none";
  elements.results.classList.remove("show");
  elements.countdown.textContent = testState.testDuration;

  // Remove dynamically created restart button from results screen
  const resultsRestartBtn = elements.results.querySelector(".restart-btn");
  if (resultsRestartBtn) {
    resultsRestartBtn.remove();
  }

  // Reset word display styling
  const allChars = elements.wordsContent.querySelectorAll(".char");
  allChars.forEach((char) => {
    char.classList.remove("correct", "incorrect");
  });

  // Reset word highlighting
  const allWords = elements.wordsContent.querySelectorAll(".word");
  allWords.forEach((word) => {
    word.classList.remove("current", "completed");
  });

  // Generate new words and reset display
  generateTestWords();
  updateCaretPosition();

  // Focus on word display with a small delay to ensure proper focus
  setTimeout(() => {
    if (elements.wordDisplay.focus) {
      elements.wordDisplay.focus();
    }
  }, 100);
}

/**
 * Start caret blinking
 */
function startCaretBlinking() {
  if (elements.caret) {
    elements.caret.classList.add('blinking');
  }
}

/**
 * Stop caret blinking
 */
function stopCaretBlinking() {
  if (elements.caret) {
    elements.caret.classList.remove('blinking');
    elements.caret.style.opacity = '1';
  }
}

/**
 * Handle user typing - stop blinking and set timeout to restart
 */
function handleTyping() {
  testState.isTyping = true;
  stopCaretBlinking();
  
  // Clear existing timeout
  if (testState.caretBlinkTimeout) {
    clearTimeout(testState.caretBlinkTimeout);
  }
  
  // Start blinking again after 1 second of no typing
  testState.caretBlinkTimeout = setTimeout(() => {
    testState.isTyping = false;
    startCaretBlinking();
  }, 1000);
}

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", initializeApp);
