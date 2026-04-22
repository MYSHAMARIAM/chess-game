// client/animations.js

function showOverlay(type, reason) {
  const overlay   = document.getElementById('overlay');
  const emoji     = document.getElementById('overlayEmoji');
  const title     = document.getElementById('overlayTitle');
  const message   = document.getElementById('overlayMessage');

  // Set content based on result type
  const content = {
    win:  { emoji: '🏆', title: 'You Win!',     bg: 'rgba(0,200,100,0.15)' },
    lose: { emoji: '😔', title: 'You Lose!',    bg: 'rgba(200,50,50,0.15)' },
    draw: { emoji: '🤝', title: "It's a Draw!",  bg: 'rgba(100,100,200,0.15)' }
  };

  const c = content[type] || content.draw;
  emoji.textContent       = c.emoji;
  title.textContent       = c.title;
  message.textContent     = reason;
  overlay.style.background = c.bg;

  overlay.classList.remove('hidden');

  // Launch confetti for a win 🎉
  if (type === 'win') launchConfetti();
}

// Simple confetti effect using canvas
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 4,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`,
    speed: Math.random() * 4 + 2,
    spin:  Math.random() * 0.2 - 0.1,
    angle: 0
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y     += p.speed;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw); // Run for ~3 seconds
    else canvas.remove();
  }
  draw();
}