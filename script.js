// BOOT SEQUENCE
const bootText = document.getElementById('boot-text');
const bootScreen = document.getElementById('boot-screen');
const shellPrompt = document.getElementById('shell-prompt');
const mainElements = document.querySelectorAll('.hidden-after-boot');

let bootLines = [
  { type: "success", text: "initializing..." },
  { type: "neutral", text: "verifying bios integrity... ok" },
  { type: "success", text: "checking memory: 8192mb detected" },
  { type: "neutral", text: "allocating swap space... 1024mb" },
  { type: "success", text: "mounting root filesystem..." },
  { type: "success", text: "detecting hardware modules..." },
  { type: "success", text: "loaded: keyboard, display, mouse" },
  { type: "warn", text: "bluetooth module missing — skipped" },
  { type: "success", text: "wibbly wobbly timey wimey stuff..." },
  { type: "warn", text: "deprecated module 'hope.dll' — using backup" },
  { type: "success", text: "background systems: nominal" },
  { type: "neutral", text: "establishing unsecure session..." },
  { type: "success", text: "generating synthetic personality: damah" },
  { type: "neutral", text: "verifying boot sequence integrity... ok" },
  { type: "neutral", text: "system boot complete" }
];

fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    const ipLine = `located user at ip address: ${data.ip}`;
    const locationLine = `located user in ${data.city?.toLowerCase() || 'unknown'}, ${data.country_name?.toLowerCase() || 'unknown'}`;
    const timezoneLine = `timezone: ${data.timezone || 'unknown'}`;
    const coordLine = `coordinates: ${data.latitude || '?'}, ${data.longitude || '?'}`;

    bootLines.splice(3, 0,
      { type: "neutral", text: ipLine },
      { type: "neutral", text: locationLine },
      { type: "neutral", text: timezoneLine },
      { type: "neutral", text: coordLine }
    );
  })
  .catch(() => {
    bootLines.splice(3, 0,
      { type: "warn", text: "unable to locate user ip: [anonymous]" },
      { type: "warn", text: "unable to determine user location" },
      { type: "warn", text: "timezone: unknown" },
      { type: "warn", text: "coordinates: ?, ?" }
    );
  })
  .finally(() => startBootSequence());

function startBootSequence() {
  bootText.textContent = "";
  const spinner = document.getElementById("boot-spinner");
  const spinnerFrames = ['|', '/', '-', '\\'];
  let frame = 0;

  const spinnerInterval = setInterval(() => {
    spinner.textContent = spinnerFrames[frame % spinnerFrames.length];
    frame++;
  }, 100);

  let i = 0;
  const interval = setInterval(() => {
    if (i < bootLines.length) {
      const line = document.createElement('div');
      line.textContent = bootLines[i].text;
      line.classList.add('boot-line', bootLines[i].type || 'neutral');
      bootText.appendChild(line);
      i++;
    } else {
      clearInterval(interval);
      clearInterval(spinnerInterval);
      spinner.style.display = 'none';
      shellPrompt.style.display = 'block';
      setTimeout(() => {
        bootScreen.style.display = 'none';
        mainElements.forEach(el => {
          el.classList.remove('hidden-after-boot');
          el.classList.remove('paused-during-boot');
        });
        lastMoveTime = Date.now();
        typeInitial();
      }, 1200);
    }
  }, 250);
}

// TYPEWRITER TEXT
const textElement = document.getElementById('text');
let baseText = "hi. im ";
const now = new Date();
const hour = now.getHours();

if (hour >= 5 && hour < 12) baseText = "good morning. i'm ";
else if (hour >= 12 && hour < 18) baseText = "good afternoon. i'm ";
else baseText = "good evening. i'm ";

const oldName = "damah";
const newName = "hamad";
let typingIndex = 0;

function typeInitial() {
  if (typingIndex < baseText.length + oldName.length + 1) {
    if (typingIndex < baseText.length) {
      textElement.textContent += baseText.charAt(typingIndex);
    } else if (typingIndex < baseText.length + oldName.length) {
      textElement.textContent += oldName.charAt(typingIndex - baseText.length);
    } else {
      textElement.textContent += ".";
    }
    typingIndex++;
    setTimeout(typeInitial, 100);
  } else {
    setTimeout(() => eraseName(), 2000);
  }
}

function eraseName() {
  const current = textElement.textContent;
  if (current.length > baseText.length) {
    textElement.textContent = current.slice(0, -1);
    setTimeout(eraseName, 100);
  } else {
    textElement.innerHTML = baseText;
    typeNewName(0);
  }
}

function typeNewName(index) {
  if (index < newName.length) {
    textElement.innerHTML += `<span class="highlight glow">${newName.charAt(index)}</span>`;
    setTimeout(() => typeNewName(index + 1), 150);
  } else {
    textElement.innerHTML += `<span style="color: white;">.</span>`;
    setTimeout(() => {
      startQuotes();
      startIdleCheck();
    }, 5000);
  }
}

// OOGWAY QUOTES
const quotes = [
  "yesterday is history, tomorrow is a mystery, but today is a gift.",
  "there are no accidents.",
  "your mind is like this water, my friend.",
  "you are too concerned about what was and what will be.",
  "you must let go of the illusion of control.",
  "look at this tree, i cannot make it blossom when it suits me.",
  "one often meets his destiny on the road he takes to avoid it.",
  "the more you take, the less you have.",
  "when the path you walk always leads back to yourself, you never get anywhere.",
  "you must believe. that is all.",
  "inner peace, inner peace.",
  "anything is possible when you have inner peace.",
  "maybe it can, if you are willing to guide it, to nurture it, to believe in it."
];

const quoteElement = document.getElementById('quote');
let quoteIndex = 0;
let charIndex = 0;

function typeQuote() {
  const currentQuote = quotes[quoteIndex];
  const quoted = `\"${currentQuote}\"`;
  if (charIndex < quoted.length) {
    quoteElement.textContent += quoted.charAt(charIndex);
    charIndex++;
    setTimeout(typeQuote, 50);
  } else {
    setTimeout(() => eraseQuote(), 10000);
  }
}

function eraseQuote() {
  const current = quoteElement.textContent;
  if (current.length > 0) {
    quoteElement.textContent = current.slice(0, -1);
    setTimeout(eraseQuote, 25);
  } else {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    charIndex = 0;
    setTimeout(typeQuote, 500);
  }
}

function startQuotes() {
  quoteElement.style.opacity = 1;
  typeQuote();
}

// CLOCK
function updateClock() {
  const clock = document.getElementById('clock');
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const dateStr = now.toLocaleDateString(undefined, options);
  const timeStr = now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  clock.textContent = `${dateStr} | ${timeStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// TRAIL + IDLE
const trailContainer = document.getElementById('trail');
const cursor = document.getElementById('customCursor');
const idleMessage = document.getElementById('idleMessage');

const fadeTargets = [
  document.getElementById('text'),
  document.querySelector('.social'),
  document.querySelector('.small-text'),
  document.querySelector('.cat'),
  quoteElement
];

const symbols = ['_', '*', '@', '~', '!', '?', '£', '$', '%', '^', '&', '*', '(', ')'];
let lastMoveTime = Date.now();
let idle = false;

function resetIdleTimer() {
  if (idle) {
    cursor.style.opacity = 1;
    idleMessage.style.opacity = 0;
    document.body.style.backgroundColor = '#0a0a0a';
    fadeTargets.forEach(el => el?.classList.remove('idle-fade'));
    idle = false;
  }
  lastMoveTime = Date.now();
}

// Desktop Mouse Trail
if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  document.addEventListener('mousemove', (e) => {
    const span = document.createElement('span');
    span.className = 'trail-char';
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = `${e.clientX}px`;
    span.style.top = `${e.clientY}px`;
    trailContainer.appendChild(span);
    setTimeout(() => span.remove(), 600);

    if (cursor) {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }

    resetIdleTimer();
  });
}

// Mobile Explosion
function createExplosion(x, y) {
  const burstSymbols = ['_', '*', '@', '~', '!', '?', '£', '$', '%', '^', '&', '*', '(', ')'];

  for (let i = 0; i < 12; i++) {
    const span = document.createElement('span');
    span.className = 'trail-char burst-char';
    span.textContent = burstSymbols[Math.floor(Math.random() * burstSymbols.length)];
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 40 + 20;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    span.style.setProperty('--dx', `${dx}px`);
    span.style.setProperty('--dy', `${dy}px`);

    trailContainer.appendChild(span);
    setTimeout(() => span.remove(), 700);
  }
}

// Trigger explosion on tap
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    createExplosion(touch.clientX, touch.clientY);
    resetIdleTimer();
  });
  document.addEventListener('touchmove', resetIdleTimer);
}

// CRT Glitch
function triggerCRTGlitch() {
  document.body.classList.add('glitch');
  setTimeout(() => {
    document.body.classList.remove('glitch');
  }, 150);
}

function scheduleCRTGlitch() {
  const delay = Math.random() * 30000 + 30000;
  setTimeout(() => {
    triggerCRTGlitch();
    scheduleCRTGlitch();
  }, delay);
}
scheduleCRTGlitch();

// Idle checker
function startIdleCheck() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  setInterval(() => {
    if (!idle && Date.now() - lastMoveTime > 15000) {
      idle = true;
      cursor.style.opacity = 0.1;
      idleMessage.style.opacity = 1;
      idleMessage.textContent = isMobile ? "tap tap... still here? :(" : "you there? :(";
      document.body.style.backgroundColor = '#020202';
      fadeTargets.forEach(el => el?.classList.add('idle-fade'));
    }
  }, 1000);
}
