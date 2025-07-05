# WPM Typing Test Implementation Plan

This document outlines the development plan for the WPM typing test application, based on the provided concept sketches and requirements.

## Phase 1: Project Setup & Foundational HTML

- [ ] Initialize project with `index.html`, `style.css`, and `script.js`.
- [ ] Create an `assets` directory for `logo.png`.
- [ ] Convert `logo.png` to `favicon.ico` and place it in the root or assets folder.
- [ ] Set up the basic HTML structure in `index.html`, including header, main content, and footer sections.
- [ ] Link external resources in `index.html`: CSS, JavaScript, Google Fonts ('Lexend', 'Arvo'), and favicon.
- [ ] Create a `words.js` file and populate it with the provided list of common English words.
- [ ] Add basic styling to `style.css`, including the background color (`#b33939ff`) and global font settings.

## Phase 2: Building the Static UI (Pre-Test State)

- [ ] **Header:**
    - [ ] Implement the header layout with the logo and "typetest" title.
    - [ ] Style the logo and title text according to concept sketch #1 (Lexend font, colors, drop shadow).
- [ ] **Footer:**
    - [ ] Implement and style the footer with the copyright notice.
- [ ] **Time Selector:**
    - [ ] Create the "15 30 60" time selection UI elements.
    - [ ] Style the time selectors (Lexend font, colors for selected/unselected, drop shadow).
- [ ] **Word Display Box:**
    - [ ] Create the main rounded rectangle for displaying words (`#f3f3f3`, drop shadow).
    - [ ] Write a JavaScript function to randomly select words from `words.js` and populate the display box.
    - [ ] Structure the words inside the box: each character should be wrapped in a `<span>` for individual styling and position tracking.
    - [ ] Style the word text as per the spec (Lexend, `#000000`).
- [ ] **Caret:**
    - [ ] Implement the text caret as a separate element (e.g., a `<span>` or `<div>`).
    - [ ] Style the caret with a blinking animation.
    - [ ] Position the caret at the start of the very first character.
- [ ] **Restart Button:**
    - [ ] Create and style the "Restart (TAB)" button (yellowish color, Lexend font, text color, drop shadow).

## Phase 3: Core Typing Logic and Interaction

- [ ] **Input Handling:**
    - [ ] Set focus to the word display box on page load so the user can start typing immediately.
    - [ ] Add a `keydown` event listener to capture all user keyboard input.
- [ ] **Test Start Trigger:**
    - [ ] On the *first* valid character input, trigger the start of the test.
    - [ ] Animate the UI transition: smoothly hide the time selector and show the main countdown timer.
- [ ] **Timer Mechanism:**
    - [ ] Implement the countdown timer based on the selected time (defaulting to 60s).
    - [ ] Style the countdown timer as per concept sketch #2 (larger, `#f1c40f`, drop shadow).
    - [ ] The timer should visually update every second.
- [ ] **Character Validation Logic:**
    - [ ] On each key press, compare the input with the character at the caret's current position.
    - [ ] **Correct Input:** Change the character's `<span>` color to green (`#44bd32`).
    - [ ] **Incorrect Input:** Change the character's `<span>` color to red (`#eb2f06`).
    - [ ] **Backspace:** Handle moving the caret backward and resetting the character's style to default (untyped).
    - [ ] Keep a running count of `correct key strokes` for the final WPM calculation.
- [ ] **Caret Movement:**
    - [ ] Implement smooth, animated caret movement.
    - [ ] On each valid input (correct, incorrect, or backspace), calculate the position of the next (or previous) character's `<span>` and transition the caret's position using CSS transforms.

## Phase 4: Dynamic Line Scrolling

- [ ] **Line Change Trigger:**
    - [ ] Detect when the user correctly types a space after the last word on the top line.
- [ ] **Scrolling Animation:**
    - [ ] Animate the completed top line moving up and out of the box.
    - [ ] Animate the second line moving up to take the top line's position.
    - [ ] This requires the word box container to have `overflow: hidden`.
- [ ] **New Line Generation:**
    - [ ] Write a function to generate a new line of random words.
    - [ ] Animate the new line appearing at the bottom of the box.
    - [ ] Ensure the scrolling is fast and smooth to not interrupt the typing flow.

## Phase 5: Test Completion and Results Display

- [ ] **End of Test:**
    - [ ] The test concludes when the countdown timer reaches 0.
- [ ] **WPM Calculation:**
    - [ ] Once the timer finishes, calculate the final score using the formula: `WPM = round(correct key strokes / 5)`.
- [ ] **UI Transition to Results:**
    - [ ] Smoothly fade out the entire typing interface (word box, timer).
    - [ ] Smoothly fade in the results display screen.
- [ ] **Results Display:**
    - [ ] Display the calculated WPM score.
    - [ ] Style the WPM number and "wpm" text as specified in concept sketch #8 (Arvo font, colors, drop shadow).

## Phase 6: Reset and Refinement

- [ ] **Restart Logic:**
    - [ ] Implement the `restartTest` function that will be called by clicking the Restart button or pressing the TAB key.
    - [ ] This function must reset the entire application state: reset timer, regenerate words, reset caret, clear scores, and restore the pre-test UI.
- [ ] **Event Listeners:**
    - [ ] Add a `click` listener to the Restart button.
    - [ ] Add a `keydown` listener to the document to handle the TAB key for restarting.
    - [ ] Add click listeners to the "15", "30", "60" options to update the selected test duration.
- [ ] **Responsiveness:**
    - [ ] Add CSS media queries to ensure the layout is functional and looks good on various screen sizes, from mobile to desktop.
- [ ] **Final Polish & Review:**
    - [ ] Test for edge cases (e.g., rapid typing, holding down backspace, resizing window during the test).
    - [ ] Review all animations and transitions for smoothness.
    - [ ] Adhere to the `cursor-rules.md` for naming conventions and code style. 