import './style.css'
import './animations.css'

// Sample sentences for typing test
const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
  "Sphinx of black quartz, judge my vow",
  "A wizard's job is to vex chumps quickly in fog",
  "Watch Jeopardy!, Alex Trebek's fun quiz game",
  "Two driven jocks help fax my big quiz",
  "The jay, pig, fox, zebra and my wolves quack",
  "Waltz, nymph, for quick jigs vex Bud"
];

let currentSentence = '';
let currentInput = '';
let startTime = null;
let isTestActive = false;
let bestWPM = 0;
let lastWPM = 0;
let settings = {
  showTimer: true,
  soundEffects: true,
  theme: 'dark',
  fontSize: 'medium'
};

// Keep track of test history
let testHistory = [];

function getRandomSentence() {
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function calculateWPM(timeInSeconds, wordCount) {
  return Math.round((wordCount / timeInSeconds) * 60);
}

function calculateAccuracy(typed, original) {
  const typedWords = typed.split(' ');
  const originalWords = original.split(' ');
  let correct = 0;
  
  typedWords.forEach((word, index) => {
    if (word === originalWords[index]) correct++;
  });
  
  return Math.round((correct / originalWords.length) * 100);
}

function formatTime(timeInSeconds) {
  return timeInSeconds.toFixed(1);
}

function updateTimer() {
  if (startTime && isTestActive) {
    const currentTime = new Date();
    const timeElapsed = (currentTime - startTime) / 1000;
    document.getElementById('timer').textContent = formatTime(timeElapsed) + 's';
    requestAnimationFrame(updateTimer);
  }
}

function updateDisplay() {
  const display = document.getElementById('display');
  const words = currentSentence.split(' ');
  const typedWords = currentInput.split(' ');
  
  const formattedWords = words.map((word, index) => {
    const typedWord = typedWords[index] || '';
    if (typedWord === '') {
      return `<span class="remaining">${word}</span>`;
    } else if (typedWord === word) {
      return `<span class="correct">${word}</span>`;
    } else {
      return `<span class="incorrect">${word}</span>`;
    }
  });
  
  display.innerHTML = formattedWords.join(' ');
}

function updateStats() {
  if (testHistory.length > 0) {
    const lastTest = testHistory[testHistory.length - 1];
    document.getElementById('last-wpm').textContent = lastTest.wpm;
    document.getElementById('last-accuracy').textContent = lastTest.accuracy + '%';
    document.getElementById('best-wpm').textContent = Math.max(...testHistory.map(t => t.wpm));
  }
}

function startNewTest() {
  currentSentence = getRandomSentence();
  currentInput = '';
  startTime = null;
  isTestActive = true;
  document.getElementById('input').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('timer').textContent = '0.0s';
  updateDisplay();
}

function showCoffeePopup(wpm) {
  const popup = document.createElement('div');
  popup.className = 'coffee-container';
  popup.innerHTML = `
    <div class="coffee-popup">
      <div class="coffee-cup">
        <div class="steam"></div>
        <div class="steam"></div>
        <div class="steam"></div>
        <div class="cup">
          <div class="handle"></div>
        </div>
      </div>
      <div class="celebration-text">
        🎉 Amazing! ${wpm} WPM 🎉
        <br>
        You've earned a virtual coffee! ☕
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.classList.add('show-coffee');
  }, 100);

  // Remove the popup after animation
  setTimeout(() => {
    popup.classList.remove('show-coffee');
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 500);
  }, 3000);
}

function handleInput(e) {
  if (!isTestActive) return;
  
  if (!startTime && e.target.value.length > 0) {
    startTime = new Date();
    if (settings.showTimer) {
      updateTimer();
    }
  }
  
  currentInput = e.target.value;
  updateDisplay();
  
  // Check if test is complete
  if (currentInput === currentSentence) {
    const endTime = new Date();
    const timeElapsed = (endTime - startTime) / 1000;
    const wordCount = currentSentence.split(' ').length;
    const wpm = calculateWPM(timeElapsed, wordCount);
    const accuracy = calculateAccuracy(currentInput, currentSentence);
    
    // Save test results
    testHistory.push({ wpm, accuracy, timeElapsed, sentence: currentSentence });
    
    // Update best WPM
    if (wpm > bestWPM) bestWPM = wpm;
    lastWPM = wpm;
    
    document.getElementById('result').textContent = 
      `Test completed! WPM: ${wpm} | Accuracy: ${accuracy}% | Time: ${formatTime(timeElapsed)}s`;
    isTestActive = false;
    updateStats();
    
    // Show coffee celebration
    showCoffeePopup(wpm);
  }
}

function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light-theme');
  localStorage.setItem('typing-test-settings', JSON.stringify(settings));
}

function changeFontSize(size) {
  settings.fontSize = size;
  document.getElementById('display').className = `display font-${size}`;
  localStorage.setItem('typing-test-settings', JSON.stringify(settings));
}

function repeatLastSentence() {
  if (testHistory.length > 0) {
    currentSentence = testHistory[testHistory.length - 1].sentence;
    currentInput = '';
    startTime = null;
    isTestActive = true;
    document.getElementById('input').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('timer').textContent = '0.0s';
    updateDisplay();
  }
}

// Setup the HTML
document.querySelector('#app').innerHTML = `
  <div class="typing-test">
    <header>
      <h1>Typing Speed Test</h1>
      <div class="settings">
        <button id="theme-toggle" class="theme-toggle" title="Toggle Theme">
          <span class="moon"></span>
          <span class="sun"></span>
        </button>
      </div>
    </header>
    
    <div class="stats-container">
      <div class="stat-box">
        <label>Best WPM</label>
        <span id="best-wpm">0</span>
      </div>
      <div class="stat-box">
        <label>Last WPM</label>
        <span id="last-wpm">0</span>
      </div>
      <div class="stat-box">
        <label>Last Accuracy</label>
        <span id="last-accuracy">0%</span>
      </div>
      <div class="stat-box">
        <label>Timer</label>
        <span id="timer">0.0s</span>
      </div>
    </div>

    <div id="display" class="display"></div>
    <input type="text" id="input" class="input" placeholder="Start typing here..." autocomplete="off">
    <div id="result" class="result"></div>
    
    <div class="button-container">
      <button id="new-test" class="button primary">New Test</button>
      <button id="repeat-test" class="button">Repeat Last</button>
    </div>
  </div>
`

// Add event listeners
document.getElementById('input').addEventListener('input', handleInput);
document.getElementById('new-test').addEventListener('click', startNewTest);
document.getElementById('repeat-test').addEventListener('click', repeatLastSentence);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Load saved settings
const savedSettings = localStorage.getItem('typing-test-settings');
if (savedSettings) {
  settings = { ...settings, ...JSON.parse(savedSettings) };
  if (settings.theme === 'light') {
    document.body.classList.add('light-theme');
  }
}

// Start the first test
startNewTest();
