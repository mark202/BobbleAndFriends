const canvas = document.getElementById("game");

const levelNameEl = document.querySelector(".level-name");
const shotsValueEl = document.querySelector(".shots__value");
const starEls = [...document.querySelectorAll(".star")];
const tooltipEl = document.getElementById("tooltip");
const levelCompleteEl = document.getElementById("level-complete");
const levelCompleteMessage = document.querySelector(".level-complete__message");
const levelCompleteStars = document.querySelector(".level-complete__stars");

const resetLevelBtn = document.getElementById("reset-level");
const nextLevelBtn = document.getElementById("next-level");
const replayBtn = document.getElementById("replay-button");
const advanceBtn = document.getElementById("advance-button");

const VIRTUAL_WIDTH = 900;
const VIRTUAL_HEIGHT = 560;

const levels = [
  {
    name: "Misty Lily Pad",
    shots: 6,
    shotGoals: { three: 4, two: 5 },
    sling: { x: 150, y: 420 },
    bumpers: [
      { x: 420, y: 320, w: 120, h: 26, bounce: 1.2, angle: 0 },
      { x: 650, y: 210, w: 30, h: 160, bounce: 1.05, angle: 0 },
    ],
    gates: [
      { x: 520, y: 410, w: 24, h: 140, color: "orange", active: true },
    ],
    targets: [
      { x: 620, y: 460, r: 26, color: "orange", cleared: false },
      { x: 780, y: 160, r: 26, color: "aqua", cleared: false },
      { x: 520, y: 150, r: 26, color: "violet", cleared: false },
    ],
    tooltip:
      "Fling Bobble across the swampy pool. Smash the glowing buds to open gates and finish the run!",
  },
  {
    name: "Lantern Lagoon",
    shots: 7,
    shotGoals: { three: 4, two: 6 },
    sling: { x: 140, y: 420 },
    bumpers: [
      { x: 360, y: 190, w: 220, h: 32, bounce: 1.25, angle: 0 },
      { x: 540, y: 360, w: 180, h: 32, bounce: 1.1, angle: 0 },
      { x: 760, y: 280, w: 32, h: 220, bounce: 1.05, angle: 0 },
    ],
    gates: [
      { x: 520, y: 180, w: 26, h: 130, color: "violet", active: true },
      { x: 700, y: 340, w: 26, h: 160, color: "orange", active: true },
    ],
    targets: [
      { x: 320, y: 450, r: 24, color: "aqua", cleared: false },
      { x: 460, y: 280, r: 24, color: "violet", cleared: false },
      { x: 660, y: 120, r: 28, color: "orange", cleared: false },
      { x: 820, y: 440, r: 26, color: "aqua", cleared: false },
    ],
    tooltip:
      "Hit matching buds to lower vine gates. Bounce off mushrooms to reroute your shot!",
  },
  {
    name: "Glowroot Grotto",
    shots: 8,
    shotGoals: { three: 5, two: 7 },
    sling: { x: 160, y: 420 },
    bumpers: [
      { x: 400, y: 210, w: 160, h: 32, bounce: 1.2, angle: 0 },
      { x: 580, y: 440, w: 140, h: 32, bounce: 1.2, angle: 0 },
      { x: 750, y: 220, w: 36, h: 200, bounce: 1.08, angle: 0 },
      { x: 500, y: 320, w: 36, h: 200, bounce: 1.1, angle: 0 },
    ],
    gates: [
      { x: 520, y: 120, w: 28, h: 160, color: "aqua", active: true },
      { x: 700, y: 360, w: 28, h: 160, color: "violet", active: true },
    ],
    targets: [
      { x: 320, y: 150, r: 24, color: "orange", cleared: false },
      { x: 520, y: 460, r: 26, color: "violet", cleared: false },
      { x: 820, y: 180, r: 26, color: "aqua", cleared: false },
      { x: 760, y: 460, r: 26, color: "orange", cleared: false },
      { x: 600, y: 240, r: 24, color: "violet", cleared: false },
    ],
    tooltip:
      "Bobble's whole crew is cheering now. Remember: long rebounds mean bigger shakes and faster clears!",
  },
];

const COLORS = {
  orange: "#ffb347",
  aqua: "#7df6ff",
  violet: "#d0a2ff",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

class JuiceFX {
  constructor() {
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
  }

  addShake(amount) {
    this.shakeMagnitude = Math.min(20, this.shakeMagnitude + amount);
    this.shakeTime = Math.min(0.45, this.shakeTime + 0.15);
  }

  apply(ctx) {
    if (this.shakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      const shakeY = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      ctx.translate(shakeX, shakeY);
      this.shakeMagnitude *= 0.88;
      this.shakeTime -= 1 / 60;
    }
  }
}

class SoundBoard {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  play(type) {
    this.ensureContext();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    let freq = 440;
    let duration = 0.25;

    if (type === "launch") {
      freq = 320;
      duration = 0.2;
    } else if (type === "hit") {
      freq = 540;
      duration = 0.25;
    } else if (type === "target") {
      freq = 760;
      duration = 0.35;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 0.6, now + duration);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = 1;

    this.levelIndex = 0;
    this.level = null;

    this.ball = {
      radius: 22,
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      aiming: false,
      launched: false,
      stretch: 1,
      trail: [],
    };

    this.shotsRemaining = 0;
    this.shotsTaken = 0;

    this.lastTimestamp = 0;
    this.pointerId = null;
    this.pointerPos = { x: 0, y: 0 };

    this.fx = new JuiceFX();
    this.sound = new SoundBoard();

    this.animation = null;

    this.initEvents();
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.startLevel(0);
  }

  initEvents() {
    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.resetBall();
      }
    });

    resetLevelBtn.addEventListener("click", () => this.startLevel(this.levelIndex));
    nextLevelBtn.addEventListener("click", () =>
      this.startLevel((this.levelIndex + 1) % levels.length)
    );
    replayBtn.addEventListener("click", () => this.startLevel(this.levelIndex));
    advanceBtn.addEventListener("click", () =>
      this.startLevel((this.levelIndex + 1) % levels.length)
    );
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(rect.width * ratio);
    this.canvas.height = Math.round(rect.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.scale = rect.width / VIRTUAL_WIDTH;
  }

  startLevel(index) {
    this.levelIndex = index;
    this.level = JSON.parse(JSON.stringify(levels[index]));
    this.shotsRemaining = this.level.shots;
    this.shotsTaken = 0;
    this.ball.pos = { ...this.level.sling };
    this.ball.vel = { x: 0, y: 0 };
    this.ball.aiming = false;
    this.ball.launched = false;
    this.ball.trail = [];
    this.ball.stretch = 1;
    this.pointerId = null;

    levelNameEl.textContent = `Level ${index + 1}: ${this.level.name}`;
    shotsValueEl.textContent = this.shotsRemaining;
    starEls.forEach((el) => el.classList.remove("active"));
    tooltipEl.textContent = this.level.tooltip;
    levelCompleteEl.classList.remove("visible");

    cancelAnimationFrame(this.animation);
    this.lastTimestamp = performance.now();
    this.animation = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  onPointerDown(event) {
    if (this.pointerId !== null && this.pointerId !== event.pointerId) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.scale;
    const y = (event.clientY - rect.top) / this.scale;

    const dx = x - this.ball.pos.x;
    const dy = y - this.ball.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.ball.radius * 2 && !this.ball.launched && this.shotsRemaining > 0) {
      this.pointerId = event.pointerId;
      this.ball.aiming = true;
      this.pointerPos = { x, y };
      this.sound.play("launch");
    }
  }

  onPointerMove(event) {
    if (this.pointerId !== event.pointerId || !this.ball.aiming) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.scale;
    const y = (event.clientY - rect.top) / this.scale;
    this.pointerPos = { x, y };
  }

  onPointerUp(event) {
    if (this.pointerId !== event.pointerId || !this.ball.aiming) return;

    this.pointerId = null;
    this.ball.aiming = false;

    const sling = this.level.sling;
    const pullX = sling.x - this.pointerPos.x;
    const pullY = sling.y - this.pointerPos.y;
    const pullLength = Math.hypot(pullX, pullY);

    if (pullLength < 10) {
      this.ball.pos = { ...sling };
      return;
    }

    const maxPull = 180;
    const clamped = Math.min(pullLength, maxPull);
    const power = clamped * 0.035;

    const vx = (pullX / pullLength) * power * 28;
    const vy = (pullY / pullLength) * power * 28;

    this.ball.vel.x = vx;
    this.ball.vel.y = vy;
    this.ball.launched = true;
    this.shotsRemaining -= 1;
    this.shotsTaken += 1;
    shotsValueEl.textContent = this.shotsRemaining;
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.033);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    this.animation = requestAnimationFrame((time) => this.loop(time));
  }

  update(dt) {
    if (this.ball.launched) {
      this.integrateBall(dt);
      this.handleCollisions();
      this.handleTargets();
      this.checkGateStates();
      this.updateTrail();

      const speed = Math.hypot(this.ball.vel.x, this.ball.vel.y);
      if (speed < 15) {
        this.resetTimer = (this.resetTimer || 0) + dt;
      } else {
        this.resetTimer = 0;
      }

      if (this.resetTimer > 1.1 || this.isBallOutOfBounds()) {
        this.resetBall();
      }
    } else {
      this.resetTimer = 0;
      this.updateTrail(true);
    }

    if (this.ball.aiming) {
      const sling = this.level.sling;
      const pullX = sling.x - this.pointerPos.x;
      const pullY = sling.y - this.pointerPos.y;
      const pullLength = Math.hypot(pullX, pullY);
      const maxPull = 200;
      const stretchFactor = 1 + clamp(pullLength / maxPull, 0, 1) * 0.9;
      this.ball.stretch = stretchFactor;
    } else {
      this.ball.stretch = 1;
    }
  }

  integrateBall(dt) {
    const gravity = 280;
    this.ball.vel.y += gravity * dt;

    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    // Apply damping to mimic swamp water resistance.
    this.ball.vel.x *= 0.992;
    this.ball.vel.y *= 0.992;
  }

  updateTrail(reset = false) {
    if (reset) {
      this.ball.trail = [];
      return;
    }
    this.ball.trail.unshift({ x: this.ball.pos.x, y: this.ball.pos.y, life: 1 });
    if (this.ball.trail.length > 25) this.ball.trail.pop();
    this.ball.trail.forEach((node, index) => {
      node.life = 1 - index / this.ball.trail.length;
    });
  }

  handleCollisions() {
    const ball = this.ball;
    const radius = ball.radius;

    // Walls
    if (ball.pos.x - radius < 0) {
      ball.pos.x = radius;
      ball.vel.x *= -0.85;
      this.fx.addShake(6);
      this.sound.play("hit");
    } else if (ball.pos.x + radius > VIRTUAL_WIDTH) {
      ball.pos.x = VIRTUAL_WIDTH - radius;
      ball.vel.x *= -0.85;
      this.fx.addShake(6);
      this.sound.play("hit");
    }

    if (ball.pos.y - radius < 0) {
      ball.pos.y = radius;
      ball.vel.y *= -0.8;
      this.fx.addShake(7);
      this.sound.play("hit");
    } else if (ball.pos.y + radius > VIRTUAL_HEIGHT) {
      ball.pos.y = VIRTUAL_HEIGHT - radius;
      ball.vel.y *= -0.8;
      this.fx.addShake(7);
      this.sound.play("hit");
    }

    // Bumpers & gates
    const objects = [...this.level.bumpers];
    this.level.gates.forEach((gate) => {
      if (gate.active) objects.push({ ...gate, gate: true });
    });

    objects.forEach((rect) => {
      const collision = this.circleRectCollision(ball.pos, radius, rect);
      if (collision) {
        const bounce = rect.bounce || (rect.gate ? 0.7 : 1.0);
        ball.pos.x += collision.normal.x * collision.depth;
        ball.pos.y += collision.normal.y * collision.depth;

        const dot = ball.vel.x * collision.normal.x + ball.vel.y * collision.normal.y;
        ball.vel.x -= 2 * dot * collision.normal.x;
        ball.vel.y -= 2 * dot * collision.normal.y;
        ball.vel.x *= bounce;
        ball.vel.y *= bounce;
        this.fx.addShake(5 + Math.abs(dot) * 0.02);
        this.sound.play("hit");
      }
    });
  }

  circleRectCollision(center, radius, rect) {
    const halfW = rect.w / 2;
    const halfH = rect.h / 2;
    const closestX = clamp(center.x, rect.x - halfW, rect.x + halfW);
    const closestY = clamp(center.y, rect.y - halfH, rect.y + halfH);

    const dx = center.x - closestX;
    const dy = center.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq > radius * radius) {
      return null;
    }

    const distance = Math.sqrt(distSq) || 0.0001;
    const depth = radius - distance + 0.5;
    const normal = { x: dx / distance, y: dy / distance };
    return { normal, depth };
  }

  handleTargets() {
    const ball = this.ball;
    this.level.targets.forEach((target) => {
      if (target.cleared) return;
      const dx = ball.pos.x - target.x;
      const dy = ball.pos.y - target.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= ball.radius + target.r) {
        target.cleared = true;
        this.fx.addShake(12);
        this.sound.play("target");

        const dot = ball.vel.x * dx + ball.vel.y * dy;
        const normal = { x: dx / distance, y: dy / distance };
        ball.vel.x -= 2 * dot * normal.x;
        ball.vel.y -= 2 * dot * normal.y;
        ball.vel.x *= 0.9;
        ball.vel.y *= 0.9;
      }
    });

    const allCleared = this.level.targets.every((t) => t.cleared);
    if (allCleared) {
      this.finishLevel();
    }
  }

  checkGateStates() {
    this.level.gates.forEach((gate) => {
      const colorRemaining = this.level.targets.some(
        (target) => target.color === gate.color && !target.cleared
      );
      gate.active = colorRemaining;
    });
  }

  finishLevel() {
    if (levelCompleteEl.classList.contains("visible")) return;

    this.ball.launched = false;
    this.ball.vel = { x: 0, y: 0 };

    const stars = this.calculateStars();
    starEls.forEach((el, index) => {
      if (index < stars) {
        el.classList.add("active");
      }
    });

    levelCompleteEl.classList.add("visible");
    levelCompleteMessage.textContent =
      "Bobble and the crew cheer as the swamp lights up!";
    levelCompleteStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  }

  calculateStars() {
    const goals = this.level.shotGoals;
    if (this.shotsTaken <= goals.three) return 3;
    if (this.shotsTaken <= goals.two) return 2;
    return 1;
  }

  isBallOutOfBounds() {
    const { x, y } = this.ball.pos;
    return x < -200 || x > VIRTUAL_WIDTH + 200 || y > VIRTUAL_HEIGHT + 200;
  }

  resetBall() {
    if (this.level.targets.every((t) => t.cleared)) return;

    if (this.shotsRemaining <= 0) {
      levelCompleteEl.classList.add("visible");
      levelCompleteMessage.textContent =
        "Out of shots! Bobble will try again with the crew cheering louder.";
      levelCompleteStars.textContent = "☆☆☆";
      return;
    }

    this.ball.pos = { ...this.level.sling };
    this.ball.vel = { x: 0, y: 0 };
    this.ball.launched = false;
    this.ball.trail = [];
    this.ball.stretch = 1;
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(this.scale, this.scale);

    this.drawBackground(ctx);
    this.fx.apply(ctx);
    this.drawLevel(ctx);
    this.drawBall(ctx);

    ctx.restore();
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    gradient.addColorStop(0, "#083034");
    gradient.addColorStop(1, "#021416");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.strokeStyle = "rgba(102, 242, 199, 0.08)";
    ctx.lineWidth = 1;
    for (let y = 40; y < VIRTUAL_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIRTUAL_WIDTH, y);
      ctx.stroke();
    }
  }

  drawLevel(ctx) {
    // Draw sling base
    ctx.strokeStyle = "rgba(102, 242, 199, 0.4)";
    ctx.lineWidth = 6;
    const sling = this.level.sling;
    ctx.beginPath();
    ctx.moveTo(sling.x - 20, sling.y + 40);
    ctx.lineTo(sling.x, sling.y);
    ctx.lineTo(sling.x + 20, sling.y + 40);
    ctx.stroke();

    if (this.ball.aiming) {
      ctx.strokeStyle = "rgba(125, 246, 255, 0.6)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(sling.x, sling.y);
      ctx.lineTo(this.pointerPos.x, this.pointerPos.y);
      ctx.stroke();
    }

    // Bumpers
    this.level.bumpers.forEach((bumper) => {
      ctx.save();
      ctx.translate(bumper.x, bumper.y);
      ctx.fillStyle = "rgba(125, 246, 255, 0.25)";
      ctx.strokeStyle = "rgba(125, 246, 255, 0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-bumper.w / 2, -bumper.h / 2, bumper.w, bumper.h);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Gates
    this.level.gates.forEach((gate) => {
      ctx.save();
      ctx.translate(gate.x, gate.y);
      ctx.fillStyle = gate.active
        ? `${COLORS[gate.color]}40`
        : "rgba(40, 160, 120, 0.12)";
      ctx.strokeStyle = gate.active
        ? `${COLORS[gate.color]}AA`
        : "rgba(80, 180, 150, 0.35)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.rect(-gate.w / 2, -gate.h / 2, gate.w, gate.h);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Targets
    this.level.targets.forEach((target) => {
      ctx.save();
      ctx.translate(target.x, target.y);
      const color = COLORS[target.color] || "#ffffff";
      const alpha = target.cleared ? 0.2 : 1;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, target.r);
      gradient.addColorStop(0, `${color}ff`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(0, 0, target.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();
    });
  }

  drawBall(ctx) {
    const ball = this.ball;
    const gradient = ctx.createRadialGradient(ball.pos.x - 5, ball.pos.y - 5, 4, ball.pos.x, ball.pos.y, ball.radius * 1.2);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#66f2c7");

    // Trail
    ball.trail.forEach((node) => {
      ctx.globalAlpha = node.life * 0.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ball.radius * (0.6 + node.life * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = "#66f2c7";
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(ball.pos.x, ball.pos.y);
    if (this.ball.aiming) {
      const angle = Math.atan2(ball.pos.y - this.pointerPos.y, ball.pos.x - this.pointerPos.x);
      ctx.rotate(angle);
    } else if (ball.launched) {
      const angle = Math.atan2(ball.vel.y, ball.vel.x);
      ctx.rotate(angle + Math.PI / 2);
    }

    ctx.scale(1, this.ball.stretch);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, ball.radius, ball.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius - 3, 0, Math.PI * 2);
    ctx.stroke();

    // Bobble's face
    ctx.fillStyle = "#052827";
    ctx.beginPath();
    ctx.arc(-6, -4, 4.5, 0, Math.PI * 2);
    ctx.arc(6, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-5.5, -4.5, 2.2, 0, Math.PI * 2);
    ctx.arc(6.5, -4.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#052827";
    ctx.beginPath();
    ctx.arc(0, 6, 6, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

new Game(canvas);
