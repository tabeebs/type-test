/**
 * WPM Typing Test Application
 * Main JavaScript file for handling typing test functionality
 */

// Application state
let testState = {
    isTestActive: false,
    testDuration: 60,
    timeRemaining: 60,
    currentWordIndex: 0,
    currentCharIndex: 0,
    correctKeystrokes: 0,
    words: [],
    timer: null,
    displayStartIndex: 0,  // Index of first word currently displayed
    linesGenerated: 0      // Track how many lines have been generated
};

// DOM elements
const elements = {
    timeSelector: document.getElementById('timeSelector'),
    timerDisplay: document.getElementById('timerDisplay'),
    countdown: document.getElementById('countdown'),
    wordDisplay: document.getElementById('wordDisplay'),
    wordsContent: document.getElementById('wordsContent'),
    caret: document.getElementById('caret'),
    restartBtn: document.getElementById('restartBtn'),
    results: document.getElementById('results'),
    wpmNumber: document.getElementById('wpmNumber')
};

/**
 * Initialize the application
 */
function initializeApp() {
    // Check if all required elements exist
    if (!elements.wordsContent || !elements.wordDisplay) {
        console.warn('Required DOM elements not found. Skipping initialization.');
        return;
    }
    
    generateTestWords();
    setupEventListeners();
    updateCaretPosition();
    
    // Make word display focusable for keyboard input
    elements.wordDisplay.setAttribute('tabindex', '0');
    if (elements.wordDisplay.focus) {
        elements.wordDisplay.focus();
    }
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
        console.warn('wordsContent element not found');
        return;
    }
    
    elements.wordsContent.innerHTML = '';
    
    // Display words starting from displayStartIndex, showing about 50 words
    const endIndex = Math.min(testState.displayStartIndex + 50, testState.words.length);
    const wordsToDisplay = testState.words.slice(testState.displayStartIndex, endIndex);
    
    wordsToDisplay.forEach((word, relativeIndex) => {
        const absoluteWordIndex = testState.displayStartIndex + relativeIndex;
        const wordElement = document.createElement('span');
        wordElement.className = 'word';
        wordElement.setAttribute('data-word-index', absoluteWordIndex);
        
        // Create span for each character
        for (let i = 0; i < word.length; i++) {
            const charElement = document.createElement('span');
            charElement.className = 'char';
            charElement.textContent = word[i];
            charElement.setAttribute('data-char-index', i);
            charElement.setAttribute('data-word-index', absoluteWordIndex);
            wordElement.appendChild(charElement);
        }
        
        // Add space after word (except last word)
        if (relativeIndex < wordsToDisplay.length - 1) {
            const spaceElement = document.createElement('span');
            spaceElement.className = 'char space';
            spaceElement.textContent = ' ';
            spaceElement.setAttribute('data-char-index', word.length);
            spaceElement.setAttribute('data-word-index', absoluteWordIndex);
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
    const timeOptions = document.querySelectorAll('.time-option');
    timeOptions.forEach(option => {
        option.addEventListener('click', handleTimeSelection);
    });
    
    // Restart button
    elements.restartBtn.addEventListener('click', restartTest);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyPress);
    
    // Tab key for restart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            restartTest();
        }
    });
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
    document.querySelectorAll('.time-option').forEach(option => {
        option.classList.remove('active', 'active-default');
    });
    event.target.classList.add('active');
    
    // Update countdown display
    elements.countdown.textContent = selectedTime;
}

/**
 * Handle keyboard input
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyPress(event) {
    // Prevent default behavior for typing keys
    if (event.key.length === 1 || event.key === 'Backspace') {
        event.preventDefault();
    }
    
    // Skip if test is not active and not starting
    if (!testState.isTestActive && event.key.length !== 1) {
        return;
    }
    
    // Start test on first valid character input
    if (!testState.isTestActive && event.key.length === 1) {
        startTest();
    }
    
    if (event.key === 'Backspace') {
        handleBackspace();
    } else if (event.key.length === 1) {
        handleCharacterInput(event.key);
    }
}

/**
 * Start the typing test
 */
function startTest() {
    testState.isTestActive = true;
    
    // Hide time selector and show timer
    elements.timeSelector.style.display = 'none';
    elements.timerDisplay.style.display = 'block';
    
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
    
    const currentWord = testState.words[testState.currentWordIndex];
    const currentChar = getCurrentChar();
    
    if (!currentChar) return;
    
    // Check if character is correct
    if (char === currentChar.textContent) {
        currentChar.classList.add('correct');
        testState.correctKeystrokes++;
    } else {
        currentChar.classList.add('incorrect');
    }
    
    // Move to next character
    moveToNextChar();
}

/**
 * Handle backspace input
 */
function handleBackspace() {
    if (!testState.isTestActive) return;
    
    moveToPrevChar();
}

/**
 * Get current character element
 * @returns {HTMLElement|null} Current character element
 */
function getCurrentChar() {
    // Find the word element by its data-word-index attribute
    const wordElement = elements.wordsContent.querySelector(`[data-word-index="${testState.currentWordIndex}"]`);
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
 * Check if line scrolling is needed and handle it
 */
function checkAndHandleLineScrolling() {
    if (!testState.isTestActive) return;
    
    const currentChar = getCurrentChar();
    if (!currentChar) return;
    
    const containerRect = elements.wordDisplay.getBoundingClientRect();
    const charRect = currentChar.getBoundingClientRect();
    
    // Get the height of the container minus padding
    const containerHeight = elements.wordDisplay.clientHeight - 60; // Account for padding
    const lineHeight = parseFloat(getComputedStyle(elements.wordsContent).lineHeight);
    
    // Check if we're beyond the visible area (need to scroll)
    const charTopRelative = charRect.top - containerRect.top;
    
    if (charTopRelative > containerHeight - lineHeight) {
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
            if (wordTop > firstLineTop + 10) { // 10px tolerance
                const wordIndex = parseInt(words[i].getAttribute('data-word-index'));
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
    wordsContent.style.transition = 'transform 0.15s ease-out';
    wordsContent.style.transform = 'translateY(-1.8em)';
    
    setTimeout(() => {
        // Update display start index and re-render
        testState.displayStartIndex = newStartIndex;
        testState.linesGenerated++;
        
        // Re-render words with new starting position
        renderWords();
        
        // Reset transform and remove transition
        wordsContent.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            wordsContent.style.transition = '';
        }, 150);
        
        // Update caret position after re-render
        updateCaretPosition();
    }, 150);
}

/**
 * Move to previous character
 */
function moveToPrevChar() {
    if (testState.currentCharIndex > 0) {
        testState.currentCharIndex--;
    } else if (testState.currentWordIndex > 0) {
        testState.currentWordIndex--;
        testState.currentCharIndex = testState.words[testState.currentWordIndex].length;
    }
    
    // Reset character styling
    const currentChar = getCurrentChar();
    if (currentChar) {
        currentChar.classList.remove('correct', 'incorrect');
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
    
    const currentChar = getCurrentChar();
    if (!currentChar) {
        // Position at start of first character if no current char
        const firstChar = elements.wordsContent.querySelector('.char');
        if (firstChar) {
            const rect = firstChar.getBoundingClientRect();
            const containerRect = elements.wordDisplay.getBoundingClientRect();
            elements.caret.style.left = (rect.left - containerRect.left) + 'px';
            elements.caret.style.top = (rect.top - containerRect.top) + 'px';
        }
        return;
    }
    
    const rect = currentChar.getBoundingClientRect();
    const containerRect = elements.wordDisplay.getBoundingClientRect();
    
    elements.caret.style.left = (rect.left - containerRect.left) + 'px';
    elements.caret.style.top = (rect.top - containerRect.top) + 'px';
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
    
    // Calculate WPM
    const wpm = Math.round(testState.correctKeystrokes / 5);
    
    // Show results
    elements.timerDisplay.style.display = 'none';
    elements.wordDisplay.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.results.style.display = 'block';
    elements.wpmNumber.textContent = wpm;
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
    
    // Clear timer
    if (testState.timer) {
        clearInterval(testState.timer);
        testState.timer = null;
    }
    
    // Reset UI
    elements.timeSelector.style.display = 'flex';
    elements.timerDisplay.style.display = 'none';
    elements.wordDisplay.style.display = 'block';
    elements.restartBtn.style.display = 'block';
    elements.results.style.display = 'none';
    elements.countdown.textContent = testState.testDuration;
    
    // Generate new words and reset display
    generateTestWords();
    updateCaretPosition();
    
    // Focus on word display
    elements.wordDisplay.focus();
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', initializeApp); 