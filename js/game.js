const canvas = document.getElementById("game");

const levelNameEl = document.querySelector(".level-name");
const shotsValueEl = document.querySelector(".shots__value");
const shotQueueEl = document.getElementById("shot-queue");
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
    name: "Misty Lily Pad Rally",
    sling: { x: 150, y: 420 },
    bumpers: [
      { x: 420, y: 320, w: 120, h: 26, bounce: 1.2, angle: 0 },
      { x: 650, y: 210, w: 30, h: 160, bounce: 1.05, angle: 0 },
      { x: 520, y: 120, w: 200, h: 24, bounce: 1.15, angle: 0 },
    ],
    friends: [
      { x: 600, y: 440, r: 26, color: "orange", collected: false },
      { x: 690, y: 400, r: 24, color: "orange", collected: false },
      { x: 520, y: 210, r: 24, color: "violet", collected: false },
      { x: 720, y: 240, r: 24, color: "violet", collected: false },
      { x: 780, y: 160, r: 24, color: "aqua", collected: false },
      { x: 640, y: 140, r: 24, color: "aqua", collected: false },
      { x: 760, y: 460, r: 26, color: "aqua", collected: false },
    ],
    shotSequence: ["orange", "violet", "aqua", "orange", "aqua", "violet"],
    shotGoals: { three: 3, two: 5 },
    tooltip:
      "Launch Bobble to scoop up matching friends. Chain bounces to gather a whole color squad in one splash!",
  },
  {
    name: "Lantern Lagoon Spin",
    sling: { x: 140, y: 420 },
    bumpers: [
      { x: 360, y: 190, w: 220, h: 32, bounce: 1.25, angle: 0 },
      { x: 540, y: 360, w: 180, h: 32, bounce: 1.1, angle: 0 },
      { x: 760, y: 280, w: 32, h: 220, bounce: 1.05, angle: 0 },
      { x: 620, y: 120, w: 160, h: 26, bounce: 1.18, angle: 0 },
    ],
    friends: [
      { x: 320, y: 450, r: 24, color: "aqua", collected: false },
      { x: 460, y: 280, r: 24, color: "violet", collected: false },
      { x: 660, y: 120, r: 24, color: "orange", collected: false },
      { x: 820, y: 440, r: 26, color: "aqua", collected: false },
      { x: 720, y: 320, r: 24, color: "orange", collected: false },
      { x: 580, y: 220, r: 24, color: "violet", collected: false },
      { x: 780, y: 200, r: 24, color: "aqua", collected: false },
      { x: 500, y: 440, r: 26, color: "orange", collected: false },
    ],
    shotSequence: [
      "orange",
      "aqua",
      "violet",
      "orange",
      "aqua",
      "violet",
      "aqua",
    ],
    shotGoals: { three: 4, two: 6 },
    tooltip:
      "Bounce off mushroom bumpers to curve around the lagoon. Keep matching colors to scoop every swimmer!",
  },
  {
    name: "Glowroot Grotto Parade",
    sling: { x: 160, y: 420 },
    bumpers: [
      { x: 400, y: 210, w: 160, h: 32, bounce: 1.2, angle: 0 },
      { x: 580, y: 440, w: 140, h: 32, bounce: 1.2, angle: 0 },
      { x: 750, y: 220, w: 36, h: 200, bounce: 1.08, angle: 0 },
      { x: 500, y: 320, w: 36, h: 200, bounce: 1.1, angle: 0 },
      { x: 620, y: 160, w: 180, h: 26, bounce: 1.22, angle: 0 },
    ],
    friends: [
      { x: 320, y: 150, r: 24, color: "orange", collected: false },
      { x: 520, y: 460, r: 26, color: "violet", collected: false },
      { x: 820, y: 180, r: 26, color: "aqua", collected: false },
      { x: 760, y: 460, r: 26, color: "orange", collected: false },
      { x: 600, y: 240, r: 24, color: "violet", collected: false },
      { x: 700, y: 320, r: 24, color: "aqua", collected: false },
      { x: 680, y: 420, r: 24, color: "orange", collected: false },
      { x: 560, y: 160, r: 24, color: "violet", collected: false },
      { x: 780, y: 120, r: 24, color: "aqua", collected: false },
    ],
    shotSequence: [
      "violet",
      "orange",
      "aqua",
      "violet",
      "orange",
      "aqua",
      "orange",
      "violet",
    ],
    shotGoals: { three: 5, two: 7 },
    tooltip:
      "The glowroot vines spin everyone around. Bounce wide, match colors, and parade the whole squad out!",
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
      color: null,
      carrying: [],
    };

    this.shotQueue = [];
    this.currentShotColor = null;
    this.shotsTaken = 0;

    this.lastTimestamp = 0;
    this.resetTimer = 0;
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
    this.shotQueue = [...this.level.shotSequence];
    this.currentShotColor = null;
    this.shotsTaken = 0;
    this.pointerId = null;

    this.ball.pos = { ...this.level.sling };
    this.ball.vel = { x: 0, y: 0 };
    this.ball.aiming = false;
    this.ball.launched = false;
    this.ball.trail = [];
    this.ball.stretch = 1;
    this.ball.carrying = [];
    this.ball.color = null;

    levelNameEl.textContent = `Level ${index + 1}: ${this.level.name}`;
    starEls.forEach((el) => el.classList.remove("active"));
    tooltipEl.textContent = this.level.tooltip;
    levelCompleteEl.classList.remove("visible");

    this.prepareNextShot();

    cancelAnimationFrame(this.animation);
    this.lastTimestamp = performance.now();
    this.animation = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  prepareNextShot() {
    if (this.level.friends.every((friend) => friend.collected)) {
      return false;
    }

    if (this.shotQueue.length === 0) {
      this.updateShotHUD();
      return false;
    }

    this.currentShotColor = this.shotQueue.shift();
    this.ball.color = this.currentShotColor;
    this.ball.pos = { ...this.level.sling };
    this.ball.vel = { x: 0, y: 0 };
    this.ball.aiming = false;
    this.ball.launched = false;
    this.ball.trail = [];
    this.ball.stretch = 1;
    this.ball.carrying = [];
    this.pointerId = null;
    this.pointerPos = { ...this.level.sling };

    this.updateShotHUD();
    return true;
  }

  updateShotHUD() {
    const reserveShots =
      this.shotQueue.length + (this.ball.launched || !this.ball.color ? 0 : 1);
    shotsValueEl.textContent = reserveShots;

    if (!shotQueueEl) return;

    const chips = [];
    if (!this.ball.launched && this.ball.color) {
      chips.push({ color: this.ball.color, current: true });
    }
    this.shotQueue.forEach((color) => chips.push({ color, current: false }));

    if (chips.length === 0) {
      shotQueueEl.innerHTML = '<span class="shot-chip shot-chip--empty">—</span>';
      return;
    }

    shotQueueEl.innerHTML = chips
      .map((chip) => {
        const color = COLORS[chip.color] || "#fff";
        const classes = ["shot-chip"];
        if (chip.current) classes.push("shot-chip--current");
        return `<span class="${classes.join(" ")}" style="--chip-color: ${color}"></span>`;
      })
      .join("");
  }

  showOutOfShots() {
    levelCompleteEl.classList.add("visible");
    levelCompleteMessage.textContent =
      "Out of splashes! Bobble will rally the crew and try again.";
    levelCompleteStars.textContent = "☆☆☆";
  }

  onPointerDown(event) {
    if (this.pointerId !== null && this.pointerId !== event.pointerId) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.scale;
    const y = (event.clientY - rect.top) / this.scale;

    const dx = x - this.ball.pos.x;
    const dy = y - this.ball.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.ball.radius * 2 && !this.ball.launched && this.ball.color) {
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
    this.shotsTaken += 1;
    this.currentShotColor = null;
    this.updateShotHUD();
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
      this.handleFriends();
      this.updateCarriedFriends(dt);
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
      this.updateCarriedFriends(dt);
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

    // Bumpers
    const objects = [...this.level.bumpers];

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

  handleFriends() {
    const ball = this.ball;
    let collectedThisFrame = false;

    this.level.friends.forEach((friend) => {
      if (friend.collected) return;

      const dx = ball.pos.x - friend.x;
      const dy = ball.pos.y - friend.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const minDist = ball.radius + friend.r;

      if (distance > minDist) {
        return;
      }

      const normal = { x: dx / distance, y: dy / distance };
      const overlap = minDist - distance;

      if (friend.color === ball.color) {
        friend.collected = true;
        collectedThisFrame = true;
        this.fx.addShake(12);
        this.sound.play("target");

        ball.pos.x += normal.x * overlap * 0.5;
        ball.pos.y += normal.y * overlap * 0.5;

        const speedBoost = 1.1;
        ball.vel.x *= speedBoost;
        ball.vel.y *= speedBoost;

        const spin = 2 + Math.random() * 3;
        this.ball.carrying.push({
          color: friend.color,
          angle: Math.random() * Math.PI * 2,
          distance: ball.radius + 12 + Math.random() * 8,
          spin: Math.random() < 0.5 ? spin : -spin,
        });
      } else {
        // Bounce away from different-colored friends
        ball.pos.x += normal.x * overlap;
        ball.pos.y += normal.y * overlap;
        const dot = ball.vel.x * normal.x + ball.vel.y * normal.y;
        ball.vel.x -= 2 * dot * normal.x;
        ball.vel.y -= 2 * dot * normal.y;
        ball.vel.x *= 0.92;
        ball.vel.y *= 0.92;
        this.fx.addShake(6);
        this.sound.play("hit");
      }
    });

    if (collectedThisFrame && this.level.friends.every((f) => f.collected)) {
      this.finishLevel();
    }
  }

  updateCarriedFriends(dt) {
    this.ball.carrying.forEach((friend) => {
      friend.angle += friend.spin * dt;
    });
  }

  finishLevel() {
    if (levelCompleteEl.classList.contains("visible")) return;

    this.ball.launched = false;
    this.ball.vel = { x: 0, y: 0 };
    this.ball.carrying = [];
    this.ball.color = null;
    this.currentShotColor = null;
    this.shotQueue = [];
    this.updateShotHUD();

    const stars = this.calculateStars();
    starEls.forEach((el, index) => {
      if (index < stars) {
        el.classList.add("active");
      }
    });

    levelCompleteEl.classList.add("visible");
    levelCompleteMessage.textContent =
      "You rallied every friend! Bobble starts a swamp conga in celebration.";
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
    if (this.level.friends.every((friend) => friend.collected)) return;

    this.ball.carrying = [];
    this.ball.launched = false;
    this.ball.vel = { x: 0, y: 0 };
    if (!this.prepareNextShot()) {
      this.showOutOfShots();
    }
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

    // Friends floating in the pool
    this.level.friends.forEach((friend) => {
      if (friend.collected) return;
      ctx.save();
      ctx.translate(friend.x, friend.y);
      const color = COLORS[friend.color] || "#ffffff";
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, friend.r * 1.4);
      glow.addColorStop(0, `${color}ff`);
      glow.addColorStop(1, `${color}00`);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, friend.r * 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, friend.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.stroke();
      ctx.restore();
    });
  }

  drawBall(ctx) {
    const ball = this.ball;
    const baseColor = COLORS[ball.color] || "#66f2c7";
    const gradient = ctx.createRadialGradient(
      ball.pos.x - 5,
      ball.pos.y - 5,
      4,
      ball.pos.x,
      ball.pos.y,
      ball.radius * 1.2
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, baseColor);

    // Trail
    ball.trail.forEach((node) => {
      ctx.globalAlpha = node.life * 0.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ball.radius * (0.6 + node.life * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Carrying friends orbiting Bobble
    this.ball.carrying.forEach((friend) => {
      const fx = ball.pos.x + Math.cos(friend.angle) * friend.distance;
      const fy = ball.pos.y + Math.sin(friend.angle) * friend.distance;
      const friendColor = COLORS[friend.color] || baseColor;

      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(fx, fy, ball.radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `${friendColor}40`;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(fx, fy, ball.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = friendColor;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.stroke();
    });

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
