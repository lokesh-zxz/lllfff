/* ==========================================================================
   ROMANTIC BIRTHDAY SURPRISE INTERACTION ENGINE
   Aesthetic, high-performance, and deeply emotional animations & interactions
   ========================================================================== */

// --- Global State ---
let activeSectionId = 'section-landing';
let anniversaryDate = new Date(2025, 9, 29, 0, 0, 0); // October 29, 2025 (months are 0-indexed)
let typewriterTimer = null;
let musicInterval = null;
let audioContext = null;
let synthesizerActive = false;

// --- Canvas Configuration ---
const ambientCanvas = document.getElementById('ambient-canvas');
const ambientCtx = ambientCanvas.getContext('2d');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

let particles = [];
let confettiParticles = [];
let width = (ambientCanvas.width = window.innerWidth);
let height = (ambientCanvas.height = window.innerHeight);

// Handle window resizing
window.addEventListener('resize', () => {
  width = ambientCanvas.width = confettiCanvas.width = window.innerWidth;
  height = ambientCanvas.height = confettiCanvas.height = window.innerHeight;
});

/* ==========================================================================
   PARTICLE PHYSICS ENGINE (Floating Hearts & Touch Trails)
   ========================================================================== */

class Particle {
  constructor(x, y, isSparkle = false) {
    this.x = x || Math.random() * width;
    this.y = y || height + 20;
    this.isSparkle = isSparkle;
    this.size = isSparkle ? Math.random() * 4 + 2 : Math.random() * 12 + 6;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = isSparkle ? Math.random() * -1 - 0.5 : Math.random() * -1.5 - 0.5;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.decay = Math.random() * 0.005 + 0.002;
    this.color = isSparkle 
      ? `hsl(${Math.random() * 40 + 40}, 100%, 75%)` // Golden/yellow sparkles
      : `rgba(${255}, ${Math.random() * 80 + 120}, ${Math.random() * 50 + 170}, ${this.opacity})`; // Soft pink/purple hearts
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulseDir = 1;
    this.pulseScale = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Heart pulse effect
    if (!this.isSparkle) {
      this.pulseScale += this.pulseSpeed * this.pulseDir;
      if (this.pulseScale > 1.25 || this.pulseScale < 0.85) {
        this.pulseDir *= -1;
      }
    }

    this.opacity -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    if (this.isSparkle) {
      // Draw standard star/sparkle shape
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size);
      ctx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.3);
      ctx.lineTo(this.x + this.size, this.y);
      ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
      ctx.lineTo(this.x, this.y + this.size);
      ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.3);
      ctx.lineTo(this.x - this.size, this.y);
      ctx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw Heart Shape
      ctx.translate(this.x, this.y);
      ctx.scale(this.pulseScale, this.pulseScale);
      ctx.beginPath();
      // Heart formula using Bezier curves
      const topSize = this.size;
      ctx.moveTo(0, topSize / 4);
      ctx.bezierCurveTo(0, 0, -topSize / 2, -topSize / 2, -topSize, 0);
      ctx.bezierCurveTo(-topSize * 1.5, topSize / 2, -topSize, topSize * 1.5, 0, topSize * 2.2);
      ctx.bezierCurveTo(topSize, topSize * 1.5, topSize * 1.5, topSize / 2, topSize, 0);
      ctx.bezierCurveTo(topSize / 2, -topSize / 2, 0, 0, 0, topSize / 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// Sparkle/Heart generator on mouse or touch move
let activeDraw = false;
const handleInteraction = (e) => {
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Generate particles around cursor
  for (let i = 0; i < 2; i++) {
    particles.push(new Particle(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10), Math.random() > 0.5));
  }
};

window.addEventListener('mousemove', handleInteraction);
window.addEventListener('touchmove', handleInteraction);

// Animate Ambient Canvas
function animateAmbient() {
  ambientCtx.clearRect(0, 0, width, height);

  // Randomly generate background floating hearts
  if (particles.length < 65 && Math.random() < 0.12) {
    particles.push(new Particle());
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].opacity <= 0 || particles[i].y < -30) {
      particles.splice(i, 1);
    } else {
      particles[i].draw(ambientCtx);
    }
  }

  requestAnimationFrame(animateAmbient);
}
animateAmbient();


/* ==========================================================================
   CONFETTI EXPLOSION PHYSICS
   ========================================================================== */

class Confetti {
  constructor(x, y, isGoldOnly = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 6;
    this.speedX = Math.random() * 8 - 4;
    this.speedY = Math.random() * -12 - 4;
    this.gravity = 0.35;
    this.drag = 0.98;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    
    // Aesthetic confetti colors
    const colors = ['#ff4757', '#ff6b81', '#7d5fff', '#a55eea', '#ffcca5', '#ffd200'];
    const golds = ['#ffa502', '#ffd32a', '#ffcca5', '#ffffff'];
    this.color = isGoldOnly 
      ? golds[Math.floor(Math.random() * golds.length)] 
      : colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.speedX *= this.drag;
    this.speedY += this.gravity;
    this.speedY *= this.drag;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    
    // Draw small rectangle confetti
    ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    ctx.restore();
  }
}

function launchConfetti(x, y, amount = 100, isGoldOnly = false) {
  for (let i = 0; i < amount; i++) {
    confettiParticles.push(new Confetti(x, y, isGoldOnly));
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, width, height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    confettiParticles[i].update();
    if (confettiParticles[i].y > height + 20) {
      confettiParticles.splice(i, 1);
    } else {
      confettiParticles[i].draw(confettiCtx);
    }
  }
  requestAnimationFrame(animateConfetti);
}
animateConfetti();


/* ==========================================================================
   TYPEWRITER TEXT MECHANISM
   ========================================================================== */

const typewriterSentences = [
  "For the most special girl in my life ❤️",
  "Happy Birthday Adithi 🎂",
  "Welcome to your custom digital birthday journey!",
  "Created with all the love in the universe by DilliLokesh..."
];

let sentenceIndex = 0;
let charIndex = 0;
let isDeleting = false;

function handleTypewriter() {
  const targetElement = document.getElementById('typewriter-text');
  if (!targetElement) return;

  const currentSentence = typewriterSentences[sentenceIndex];

  if (isDeleting) {
    targetElement.textContent = currentSentence.substring(0, charIndex - 1);
    charIndex--;
  } else {
    targetElement.textContent = currentSentence.substring(0, charIndex + 1);
    charIndex++;
  }

  let typingSpeed = 70;

  if (isDeleting) {
    typingSpeed = 30; // speed up deletion
  }

  // Handle sentence completion or deletion triggers
  if (!isDeleting && charIndex === currentSentence.length) {
    typingSpeed = 2200; // Pause at the end of full sentence
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    sentenceIndex = (sentenceIndex + 1) % typewriterSentences.length;
    typingSpeed = 400; // pause before typing next
  }

  typewriterTimer = setTimeout(handleTypewriter, typingSpeed);
}

// Start typewriter immediately
document.addEventListener('DOMContentLoaded', () => {
  handleTypewriter();
  setupScrollReveal();
});


/* ==========================================================================
   RELATIONSHIP LIVE COUNTUP TIMER
   Anniversary Date: October 29, 2025 (2025.10.29)
   ========================================================================== */

function initRelationshipCounter() {
  setInterval(() => {
    const now = new Date();
    const diffMs = now - anniversaryDate;
    
    if (diffMs < 0) return; // Future fallback

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // Render digits dynamically with pad start
    document.getElementById('count-days').textContent = String(days).padStart(3, '0');
    document.getElementById('count-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('count-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('count-seconds').textContent = String(seconds).padStart(2, '0');
  }, 1000);
}


/* ==========================================================================
   SECTION NAVIGATION ENGINE & TRANSITIONS
   ========================================================================== */

function changeSection(nextSectionId) {
  const currentSec = document.querySelector('.section.active');
  const nextSec = document.getElementById(nextSectionId);
  
  if (!nextSec || activeSectionId === nextSectionId) return;

  // Clear current active tags
  if (currentSec) {
    currentSec.classList.remove('active');
    
    // Delay setting hidden to allow scale down fade out CSS transition
    setTimeout(() => {
      currentSec.classList.add('hidden');
      
      // Prepare next section
      nextSec.classList.remove('hidden');
      
      // Trigger tiny tick layout recalculation for rendering transitions
      void nextSec.offsetWidth;
      
      nextSec.classList.add('active');
      activeSectionId = nextSectionId;

      // Special action triggers per section
      if (nextSectionId === 'section-timeline') {
        initRelationshipCounter();
      }
      
      // Scroll smoothly back to top for new section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Check and reveal scroll elements
      triggerScrollReveal();
    }, 800);
  }
}

// Special button landing transition
document.getElementById('btn-open-surprise').addEventListener('click', () => {
  // Try to start music synthesis or trigger HTML5 playback
  initMusicSystem();
  
  // Launch initial burst of celebratory hearts
  launchConfetti(window.innerWidth / 2, window.innerHeight * 0.7, 50);
  
  // Move to love timeline
  changeSection('section-timeline');
  
  // Show Music Control
  document.getElementById('music-player-container').classList.remove('hidden');
});


/* ==========================================================================
   SCROLL REVEAL UTILITY
   ========================================================================== */

let revealObserver;

function setupScrollReveal() {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve after showing
        revealObserver.unobserve(entry.target);
      }
    });
  }, options);

  triggerScrollReveal();
}

function triggerScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal:not(.revealed)');
  reveals.forEach(el => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add('revealed'); // Fallback
    }
  });
}

// Fallback scroll listener in case observer behaves weirdly
window.addEventListener('scroll', triggerScrollReveal);


/* ==========================================================================
   SURPRISE RIGGED QUIZ LOGIC
   ========================================================================== */

function answerQuiz(btnElement, optionNumber) {
  // Highlight correct answer button design
  btnElement.style.transform = 'scale(0.96)';
  btnElement.style.background = '#ffe3e6';
  btnElement.style.borderColor = 'var(--rose-red)';
  
  setTimeout(() => {
    btnElement.style.transform = '';
  }, 200);

  // Launch massive colorful screen confetti explosion
  launchConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 120);
  
  // Display Pop-up modal after a minor delay
  setTimeout(() => {
    const popup = document.getElementById('quiz-popup');
    popup.classList.remove('hidden');
  }, 500);
}

function closeQuizModal() {
  const popup = document.getElementById('quiz-popup');
  popup.style.opacity = '0';
  
  setTimeout(() => {
    popup.classList.add('hidden');
    popup.style.opacity = '1';
    
    // Proceed immediately to birthday cake page
    changeSection('section-birthday');
  }, 400);
}


/* ==========================================================================
   VIRTUAL BIRTHDAY CAKE & CANDLE MECHANISM
   ========================================================================== */

const birthdayCandle = document.getElementById('birthday-candle');

if (birthdayCandle) {
  birthdayCandle.addEventListener('click', blowCandleOut);
}

function blowCandleOut() {
  const candleBox = document.getElementById('cake-container');
  if (candleBox.classList.contains('extinguished')) return; // Already blown
  
  candleBox.classList.add('extinguished');
  
  // Synthesis custom wind/whoosh blowout sound using Web Audio API
  synthesizeWhooshSound();

  // Launch huge golden sparks and colorful confetti directly above the cake
  const cakeRect = candleBox.getBoundingClientRect();
  const blastX = cakeRect.left + cakeRect.width / 2;
  const blastY = cakeRect.top + 30;
  
  launchConfetti(blastX, blastY, 150, true); // Gold sparkly burst
  
  // Faint smoke particles using canvas
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(blastX, blastY, true));
  }

  // Update instruction text
  document.getElementById('cake-instruction-text').innerHTML = "Make a wish! Your magical message awaits you below ✨";
  document.getElementById('cake-instruction-text').style.color = 'var(--rose-red)';

  // Slide down and reveal the lovely romantic letter card with custom delay
  setTimeout(() => {
    const letter = document.getElementById('birthday-letter-container');
    letter.classList.remove('hidden');
    
    // Synthesize sweet ending chimes
    synthesizeHappyBirthdayChimes();
  }, 1200);
}


/* ==========================================================================
   WEB AUDIO API ROMANTIC MUSIC BOX & SOUND SYNTHESIZER
   Plays a beautiful, magical synthesized melody (Happy Birthday + Love arpeggio)
   so the application is fully self-contained and loads instantly.
   ========================================================================== */

const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

function initMusicSystem() {
  if (audioContext) return; // Already initialized

  // Create Audio Context (standardizing webkit)
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextClass();
  
  // Pre-load synth setting
  isMusicPlaying = true;
  musicToggle.classList.add('playing');
  startSynthesizerMelody();
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (!audioContext) {
      initMusicSystem();
      return;
    }
    
    if (isMusicPlaying) {
      // Pause Synthesizer
      isMusicPlaying = false;
      musicToggle.classList.remove('playing');
      stopSynthesizerMelody();
    } else {
      // Resume Synthesizer
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      isMusicPlaying = true;
      musicToggle.classList.add('playing');
      startSynthesizerMelody();
    }
  });
}

// Magical Music Box synthesis parameters
// 1 = C5, 2 = D5, 3 = E5, 4 = F5, 5 = G5, 6 = A5, 7 = B5, 8 = C6, etc.
const noteFrequencies = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00
};

// Cute, romantic "Happy Birthday" mixed with romantic chords (Music Box style)
const romanticMelody = [
  { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'B4', duration: 2 },
  { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 }, { note: 'D5', duration: 1 }, { note: 'C5', duration: 2 },
  { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'G5', duration: 1 }, { note: 'E5', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'B4', duration: 1 }, { note: 'A4', duration: 2 },
  { note: 'F5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'E5', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'D5', duration: 1 }, { note: 'C5', duration: 3 },
  
  // Followed by soft dreamy romantic arpeggio chord cycle (C - Am - F - G)
  { note: 'C5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'C6', duration: 0.5 }, { note: 'E6', duration: 1 }, { note: 'C6', duration: 1 },
  { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'A5', duration: 0.5 }, { note: 'C6', duration: 1 }, { note: 'A5', duration: 1 },
  { note: 'F4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'A5', duration: 1 }, { note: 'F5', duration: 1 },
  { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'B5', duration: 1 }, { note: 'G5', duration: 1 }
];

let melodyIndex = 0;

function playMusicBoxNote(noteName, timeOffset, duration) {
  if (!audioContext || !isMusicPlaying) return;

  const freq = noteFrequencies[noteName];
  if (!freq) return;

  const time = audioContext.currentTime + timeOffset;

  // Synthesize soft metal tines of a music box (bell-like sound)
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Pure sine wave + subtle triangle overtone for warmth
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  // Quick rise, long slow decay
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.35, time + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.5);

  // Subtle vibrato/detune for emotional vintage feeling
  osc.detune.setValueAtTime(Math.random() * 8 - 4, time);

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  osc.start(time);
  osc.stop(time + duration * 1.6);
}

function startSynthesizerMelody() {
  stopSynthesizerMelody();
  synthesizerActive = true;
  
  let currentOffset = 0;

  function scheduleNextNotes() {
    if (!synthesizerActive || !isMusicPlaying) return;

    // Schedule 4 seconds of notes in advance
    while (currentOffset < 4) {
      const currentItem = romanticMelody[melodyIndex];
      playMusicBoxNote(currentItem.note, currentOffset, currentItem.duration);
      
      currentOffset += currentItem.duration;
      melodyIndex = (melodyIndex + 1) % romanticMelody.length;
    }

    // Keep checking and scheduling notes
    musicInterval = setTimeout(() => {
      currentOffset -= 2;
      scheduleNextNotes();
    }, 2000);
  }

  scheduleNextNotes();
}

function stopSynthesizerMelody() {
  synthesizerActive = false;
  if (musicInterval) {
    clearTimeout(musicInterval);
  }
}

// Blow candle wind synthesis
function synthesizeWhooshSound() {
  if (!audioContext) return;
  
  const time = audioContext.currentTime;
  const bufferSize = audioContext.sampleRate * 0.5; // 0.5 seconds
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  // White noise generation
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = audioContext.createBufferSource();
  noiseNode.buffer = buffer;
  
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, time);
  filter.frequency.exponentialRampToValueAtTime(10, time + 0.5); // whoosh drop
  
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.4, time);
  gainNode.gain.linearRampToValueAtTime(0.001, time + 0.5);
  
  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  noiseNode.start(time);
}

// Celebration Chimes
function synthesizeHappyBirthdayChimes() {
  if (!audioContext) return;
  
  const baseTime = audioContext.currentTime;
  const chordNotes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
  
  // Arpeggiate sweet sparkling chord notes very quickly
  chordNotes.forEach((note, index) => {
    const freq = noteFrequencies[note];
    const time = baseTime + index * 0.08;
    
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.2, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start(time);
    osc.stop(time + 1.3);
  });
}
