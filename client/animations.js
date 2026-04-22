// client/animations.js — ULTRA EDITION

// ── SHOW OVERLAY ───────────────────────────
function showOverlay(type, reason) {
  const overlay = document.getElementById('overlay');
  const emoji   = document.getElementById('overlayEmoji');
  const title   = document.getElementById('overlayTitle');
  const message = document.getElementById('overlayMessage');

  const content = {
    win:  { emoji: '🏆', title: 'VICTORY!',    bg: '#0a1a0a' },
    lose: { emoji: '💀', title: 'DEFEATED',    bg: '#1a0505' },
    draw: { emoji: '⚔️',  title: 'STALEMATE',  bg: '#0a0a1a' }
  };

  const c = content[type] || content.draw;
  emoji.textContent        = c.emoji;
  title.textContent        = c.title;
  message.textContent      = reason;
  overlay.style.background = `rgba(0,0,0,0.85)`;

  // Color the overlay card
  const card = document.querySelector('.overlay-content');
  card.style.background = c.bg;

  overlay.classList.remove('hidden');

  if (type === 'win')  { epicWin(); }
  if (type === 'lose') { epicLose(); }
  if (type === 'draw') { epicDraw(); }
}

// ── 🏆 EPIC WIN ────────────────────────────
function epicWin() {
  launchFireworks();
  setTimeout(launchFireworks, 600);
  setTimeout(launchFireworks, 1200);
  goldShimmer();
  screenFlash('#00ff88', 0.3);
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 150);
  setTimeout(() => playTone(784, 0.1), 300);
  setTimeout(() => playTone(1047, 0.3), 450);
}

// ── 💀 EPIC LOSE ───────────────────────────
function epicLose() {
  dramaticShake();
  redVignette();
  screenFlash('#ff0000', 0.4);
  glitchEffect();
  playTone(200, 0.2);
  setTimeout(() => playTone(150, 0.3), 300);
}

// ── ⚔️ EPIC DRAW ───────────────────────────
function epicDraw() {
  screenFlash('#8888ff', 0.2);
  playTone(440, 0.1);
  setTimeout(() => playTone(440, 0.15), 300);
}

// ── 🎆 FIREWORKS ───────────────────────────
function launchFireworks() {
  const canvas = document.getElementById('fxCanvas') || createFXCanvas();
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Random launch point
  const x = W * (0.2 + Math.random() * 0.6);
  const y = H * (0.1 + Math.random() * 0.4);
  const hue = Math.random() * 360;

  // Explosion particles
  const particles = Array.from({ length: 80 }, () => {
    const angle = (Math.random() * Math.PI * 2);
    const speed = Math.random() * 8 + 2;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.015 + 0.01,
      size: Math.random() * 3 + 1,
      hue: hue + Math.random() * 40 - 20,
      trail: []
    };
  });

  // Sparkle particles
  const sparkles = Array.from({ length: 30 }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    life: 1,
    decay: 0.008,
    size: Math.random() * 2 + 0.5,
    hue: hue + 60
  }));

  let frame = 0;
  function animateFirework() {
    frame++;
    if (frame === 1) ctx.clearRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';

    particles.forEach(p => {
      if (p.life <= 0) return;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 5) p.trail.shift();

      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.98;
      p.life -= p.decay;

      // Draw trail
      p.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.size * (i / p.trail.length) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life * i / p.trail.length * 0.3})`;
        ctx.fill();
      });

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 1)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw sparkles
    sparkles.forEach(s => {
      if (s.life <= 0) return;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(frame * 0.1);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 90%, ${s.life})`;
      // Draw star shape
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-s.size / 2, -s.size * 2, s.size, s.size * 4);
        ctx.rotate(Math.PI / 4);
      }
      ctx.restore();
    });

    const alive = particles.filter(p => p.life > 0).length;
    if (alive > 0) requestAnimationFrame(animateFirework);
  }
  animateFirework();
}

// ── 🎊 CONFETTI RAIN ───────────────────────
function launchConfetti() {
  const canvas = document.getElementById('fxCanvas') || createFXCanvas();
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const pieces = Array.from({ length: 200 }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * -H,
    w:     Math.random() * 12 + 4,
    h:     Math.random() * 6  + 3,
    color: `hsl(${Math.random() * 360}, 90%, 65%)`,
    speed: Math.random() * 5 + 2,
    spin:  Math.random() * 0.3 - 0.15,
    sway:  Math.random() * 2 - 1,
    angle: Math.random() * Math.PI * 2,
    shape: Math.random() > 0.5 ? 'rect' : 'circle'
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      p.y     += p.speed;
      p.x     += Math.sin(frame * 0.03 + p.sway) * 1.5;
      p.angle += p.spin;
      if (p.y > H) { p.y = -20; p.x = Math.random() * W; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w/2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    frame++;
    if (frame < 300) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

// ── 💛 GOLD SHIMMER (Win) ──────────────────
function goldShimmer() {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 998;
    background: radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.2), transparent 70%);
    animation: goldFade 2s ease forwards;
  `;
  const s = document.createElement('style');
  s.textContent = `@keyframes goldFade { 0%{opacity:0} 20%{opacity:1} 100%{opacity:0} }`;
  document.head.appendChild(s);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

// ── 🔴 RED VIGNETTE (Lose) ─────────────────
function redVignette() {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 998;
    background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(200,0,0,0.6) 100%);
    animation: vignetteFade 2s ease forwards;
  `;
  const s = document.createElement('style');
  s.textContent = `@keyframes vignetteFade { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0.3} }`;
  document.head.appendChild(s);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

// ── 📳 DRAMATIC SHAKE (Lose) ───────────────
function dramaticShake() {
  const card = document.querySelector('.overlay-content');
  const s = document.createElement('style');
  s.textContent = `
    @keyframes dramaticShake {
      0%,100% { transform: translate(0,0) rotate(0deg); }
      10%     { transform: translate(-15px, 5px) rotate(-3deg); }
      20%     { transform: translate(15px, -5px) rotate(3deg); }
      30%     { transform: translate(-10px, 5px) rotate(-2deg); }
      40%     { transform: translate(10px, -5px) rotate(2deg); }
      50%     { transform: translate(-6px, 3px) rotate(-1deg); }
      60%     { transform: translate(6px, -3px) rotate(1deg); }
      70%     { transform: translate(-3px, 2px); }
      80%     { transform: translate(3px, -2px); }
    }
  `;
  document.head.appendChild(s);
  card.style.animation = 'dramaticShake 0.8s ease, overlayPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

// ── 📺 GLITCH EFFECT (Lose) ────────────────
function glitchEffect() {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 997; overflow: hidden;
  `;

  // Horizontal scan lines
  for (let i = 0; i < 8; i++) {
    const line = document.createElement('div');
    const top  = Math.random() * 100;
    const h    = Math.random() * 4 + 1;
    line.style.cssText = `
      position: absolute;
      top: ${top}%;
      left: ${Math.random() * 30}%;
      width: ${Math.random() * 80 + 20}%;
      height: ${h}px;
      background: rgba(255,0,0,${Math.random() * 0.4 + 0.1});
      animation: glitchLine ${Math.random() * 0.3 + 0.1}s steps(1) ${Math.random() * 0.5}s 3 forwards;
    `;
    div.appendChild(line);
  }

  const s = document.createElement('style');
  s.textContent = `
    @keyframes glitchLine {
      0%,100% { transform: translateX(0); opacity: 1; }
      50%     { transform: translateX(${Math.random() * 20}px); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1000);
}

// ── ⚡ SCREEN FLASH ────────────────────────
function screenFlash(color, opacity) {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; inset: 0; background: ${color};
    opacity: ${opacity}; pointer-events: none; z-index: 996;
    animation: flashOut 0.4s ease forwards;
  `;
  const s = document.createElement('style');
  s.textContent = `@keyframes flashOut { to { opacity: 0; } }`;
  document.head.appendChild(s);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 400);
}

// ── ⚡ CAPTURE FLASH ───────────────────────
function flashCapture() {
  screenFlash('rgba(255,100,0)', 0.15);

  // Shockwave ring
  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    width: 10px; height: 10px;
    border: 3px solid rgba(255,150,0,0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 995;
    animation: shockwave 0.5s ease-out forwards;
  `;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shockwave {
      to { width: 300px; height: 300px; opacity: 0; border-width: 1px; }
    }
  `;
  document.head.appendChild(s);
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 500);
}

// ── ⚠️ CHECK WARNING ───────────────────────
function flashCheck() {
  screenFlash('rgba(255,0,0)', 0.2);

  // Pulse the board border
  const wrapper = document.querySelector('.chess-board-wrapper');
  if (wrapper) {
    wrapper.style.boxShadow = '0 0 0 3px #ff4444, 0 0 30px rgba(255,68,68,0.5)';
    setTimeout(() => {
      wrapper.style.boxShadow = '';
    }, 1000);
  }
}

// ── 🔊 SOUND (Web Audio API) ──────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function playMoveSound() {
  playTone(800, 0.05, 'square');
  setTimeout(() => playTone(1000, 0.05, 'square'), 50);
}

function playCaptureSound() {
  playTone(300, 0.05, 'sawtooth');
  setTimeout(() => playTone(200, 0.1, 'sawtooth'), 60);
}

function playCheckSound() {
  playTone(880, 0.1);
  setTimeout(() => playTone(1100, 0.15), 100);
}

// ── 🎯 MOVE TRAIL ──────────────────────────
function showMoveTrail(fromSquare, toSquare) {
  // Highlight last move squares
  document.querySelectorAll('.highlight-from, .highlight-to').forEach(el => {
    el.classList.remove('highlight-from', 'highlight-to');
  });

  const fromEl = document.querySelector(`[data-square="${fromSquare}"]`);
  const toEl   = document.querySelector(`[data-square="${toSquare}"]`);
  if (fromEl) fromEl.classList.add('highlight-from');
  if (toEl)   toEl.classList.add('highlight-to');
}

// ── 📺 FX CANVAS HELPER ────────────────────
function createFXCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id    = 'fxCanvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 990;
  `;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  return canvas;
}

// ── 🌟 AMBIENT PARTICLES ───────────────────
function startAmbientParticles() {
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left     = `${Math.random() * 100}vw`;
      p.style.animationDuration  = `${Math.random() * 15 + 10}s`;
      p.style.animationDelay     = `${Math.random() * 10}s`;
      p.style.width  = `${Math.random() * 3 + 1}px`;
      p.style.height = p.style.width;
      p.style.opacity = Math.random() * 0.5 + 0.1;
      document.body.appendChild(p);
    }, i * 200);
  }
}

// ── 3D BOARD TILT ──────────────────────────
function init3DTilt() {
  const wrapper = document.querySelector('.chess-board-wrapper');
  if (!wrapper) return;

  wrapper.addEventListener('mousemove', (e) => {
    const rect   = wrapper.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    wrapper.style.transform = `perspective(1000px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    wrapper.style.transition = 'transform 0.5s ease';
  });
}

// Start ambient particles when page loads
window.addEventListener('load', () => {
  startAmbientParticles();
});