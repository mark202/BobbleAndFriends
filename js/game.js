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

const COLORS = {
  orange: "#ffb347",
  aqua: "#7df6ff",
  violet: "#d0a2ff",
  lime: "#baff7a",
};

const FRIEND_ROSTER = [
  {
    name: "Bobble",
    primary: "#f5f2ed",
    stripe: "#323c46",
    belly: "#fff8eb",
    accent: "#ffcc6f",
    eye: "#2a1f1c",
    nose: "#44313a",
  },
  {
    name: "Mila",
    primary: "#f6d8ff",
    stripe: "#8a4fd7",
    belly: "#ffe9ff",
    accent: "#ff9df6",
    eye: "#2c1740",
    nose: "#602e84",
  },
  {
    name: "Rufus",
    primary: "#ffe3c4",
    stripe: "#b45f2a",
    belly: "#fff4dc",
    accent: "#ffba7b",
    eye: "#3b2016",
    nose: "#4a2612",
  },
  {
    name: "Tika",
    primary: "#d9ffe0",
    stripe: "#3a8f4f",
    belly: "#f2fff5",
    accent: "#9dffbd",
    eye: "#163221",
    nose: "#255a38",
  },
  {
    name: "Gogo",
    primary: "#e3f4ff",
    stripe: "#2c6c8d",
    belly: "#f3fbff",
    accent: "#7dd6ff",
    eye: "#163040",
    nose: "#1d4a61",
  },
];

const levels = [
  {
    name: "Splashdown Clearing",
    shots: 8,
    starGoals: { three: 4, two: 6, one: 8 },
    tooltip:
      "Pull any lounging buddy, sling them across the pool, and crash matching colors together to cheer them out!",
    slingHint: { x: 150, y: 420 },
    walls: [
      { x: 60, y: 80, w: 120, h: 28 },
      { x: 140, y: 520, w: 220, h: 30 },
      { x: 860, y: 120, w: 80, h: 28 },
      { x: 780, y: 500, w: 190, h: 30 },
      { x: 450, y: 520, w: 280, h: 26 },
      { x: 40, y: 320, w: 70, h: 200 },
      { x: 860, y: 360, w: 70, h: 210 },
      { x: 320, y: 80, w: 220, h: 26 },
      { x: 620, y: 70, w: 180, h: 24 },
      { x: 420, y: 300, w: 28, h: 160 },
    ],
    bumpers: [
      { x: 360, y: 220, w: 160, h: 30, bounce: 1.15, angle: 0 },
      { x: 620, y: 360, w: 220, h: 30, bounce: 1.1, angle: 0 },
      { x: 730, y: 180, w: 30, h: 200, bounce: 1.05, angle: 0 },
    ],
    friends: [
      { x: 260, y: 380, r: 28, color: "orange" },
      { x: 380, y: 260, r: 26, color: "orange" },
      { x: 540, y: 180, r: 24, color: "aqua" },
      { x: 720, y: 440, r: 28, color: "aqua" },
      { x: 620, y: 280, r: 26, color: "violet" },
      { x: 460, y: 420, r: 26, color: "violet" },
    ],
  },
  {
    name: "Glowroot Spin",
    shots: 9,
    starGoals: { three: 5, two: 7, one: 9 },
    tooltip:
      "Bank tight curves off the mushroom bumpers. Same-color smashes pop friends right out of the swamp!",
    slingHint: { x: 140, y: 420 },
    walls: [
      { x: 80, y: 160, w: 110, h: 26 },
      { x: 840, y: 180, w: 120, h: 26 },
      { x: 860, y: 460, w: 80, h: 24 },
      { x: 70, y: 420, w: 110, h: 24 },
      { x: 450, y: 70, w: 260, h: 24 },
      { x: 450, y: 520, w: 320, h: 26 },
      { x: 250, y: 300, w: 28, h: 190 },
      { x: 640, y: 280, w: 28, h: 220 },
      { x: 220, y: 520, w: 160, h: 24 },
      { x: 720, y: 70, w: 160, h: 24 },
    ],
    bumpers: [
      { x: 420, y: 180, w: 240, h: 34, bounce: 1.2, angle: 0 },
      { x: 520, y: 420, w: 180, h: 30, bounce: 1.1, angle: 0 },
      { x: 780, y: 260, w: 34, h: 220, bounce: 1.08, angle: 0 },
      { x: 610, y: 120, w: 200, h: 30, bounce: 1.18, angle: 0 },
    ],
    friends: [
      { x: 320, y: 150, r: 24, color: "lime" },
      { x: 480, y: 260, r: 26, color: "lime" },
      { x: 640, y: 340, r: 26, color: "aqua" },
      { x: 760, y: 420, r: 26, color: "aqua" },
      { x: 700, y: 180, r: 24, color: "violet" },
      { x: 540, y: 460, r: 28, color: "violet" },
      { x: 420, y: 340, r: 26, color: "orange" },
      { x: 260, y: 420, r: 28, color: "orange" },
    ],
  },
  {
    name: "Lantern Parade",
    shots: 10,
    starGoals: { three: 6, two: 8, one: 10 },
    tooltip:
      "Time big ricochets through lantern gates to cascade matches. Keep someone moving until every buddy is cheering!",
    slingHint: { x: 160, y: 420 },
    walls: [
      { x: 70, y: 220, w: 120, h: 30 },
      { x: 70, y: 460, w: 130, h: 24 },
      { x: 850, y: 260, w: 120, h: 28 },
      { x: 840, y: 520, w: 120, h: 26 },
      { x: 320, y: 70, w: 220, h: 26 },
      { x: 620, y: 70, w: 220, h: 26 },
      { x: 420, y: 520, w: 260, h: 26 },
      { x: 320, y: 320, w: 30, h: 200 },
      { x: 600, y: 320, w: 30, h: 210 },
      { x: 500, y: 200, w: 230, h: 26 },
    ],
    bumpers: [
      { x: 420, y: 220, w: 180, h: 30, bounce: 1.16, angle: 0 },
      { x: 520, y: 420, w: 160, h: 28, bounce: 1.12, angle: 0 },
      { x: 760, y: 220, w: 36, h: 220, bounce: 1.05, angle: 0 },
      { x: 620, y: 140, w: 200, h: 28, bounce: 1.2, angle: 0 },
      { x: 540, y: 300, w: 32, h: 210, bounce: 1.08, angle: 0 },
    ],
    friends: [
      { x: 280, y: 160, r: 24, color: "lime" },
      { x: 360, y: 420, r: 28, color: "lime" },
      { x: 500, y: 220, r: 26, color: "orange" },
      { x: 660, y: 320, r: 26, color: "orange" },
      { x: 720, y: 160, r: 24, color: "violet" },
      { x: 780, y: 420, r: 28, color: "violet" },
      { x: 600, y: 460, r: 28, color: "aqua" },
      { x: 520, y: 120, r: 24, color: "aqua" },
      { x: 420, y: 300, r: 26, color: "orange" },
    ],
  },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

class JuiceFX {
  constructor() {
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
  }

  addShake(amount) {
    this.shakeMagnitude = Math.min(25, this.shakeMagnitude + amount);
    this.shakeTime = Math.min(0.5, this.shakeTime + 0.16);
  }

  apply(ctx) {
    if (this.shakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      const shakeY = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      ctx.translate(shakeX, shakeY);
      this.shakeMagnitude *= 0.9;
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
      freq = 260;
      duration = 0.2;
    } else if (type === "hit") {
      freq = 520;
      duration = 0.22;
    } else if (type === "target") {
      freq = 760;
      duration = 0.32;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 0.6, now + duration);
    gain.gain.setValueAtTime(0.2, now);
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
    this.friends = [];
    this.effects = [];

    this.shotsUsed = 0;
    this.levelComplete = false;
    this.spawnGrace = 0;

    this.pointerId = null;
    this.pointerPos = { x: 0, y: 0 };
    this.selectedFriend = null;

    this.lastTimestamp = 0;
    this.animation = null;

    this.fx = new JuiceFX();
    this.sound = new SoundBoard();

    this.initEvents();
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.startLevel(0);
  }

  initEvents() {
    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));

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
    this.level.walls = this.level.walls || [];
    this.friends = this.level.friends.map((friend, id) => ({
      id,
      color: friend.color,
      radius: friend.r,
      pos: { x: friend.x, y: friend.y },
      anchor: { x: friend.x, y: friend.y },
      dragPos: { x: friend.x, y: friend.y },
      vel: { x: 0, y: 0 },
      aiming: false,
      removed: false,
      isMoving: false,
      pullAmount: 0,
      pullAngle: 0,
      roster: FRIEND_ROSTER[id % FRIEND_ROSTER.length],
      faceFlip: id % 2 === 0 ? 1 : -1,
    }));

    this.effects = [];
    this.shotsUsed = 0;
    this.levelComplete = false;
    this.spawnGrace = 0.45;
    this.pointerId = null;
    this.selectedFriend = null;

    levelNameEl.textContent = `Level ${index + 1}: ${this.level.name}`;
    tooltipEl.textContent = this.level.tooltip;
    levelCompleteEl.classList.remove("visible");
    starEls.forEach((el) => el.classList.remove("active"));

    this.updateShots();

    cancelAnimationFrame(this.animation);
    this.lastTimestamp = performance.now();
    this.animation = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  updateShots() {
    const shotsLeft = Math.max(this.level.shots - this.shotsUsed, 0);
    shotsValueEl.textContent = shotsLeft;
  }

  onPointerDown(event) {
    if (this.levelComplete) return;
    if (this.pointerId !== null && this.pointerId !== event.pointerId) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.scale;
    const y = (event.clientY - rect.top) / this.scale;

    const friend = this.findFriendAt(x, y);
    if (!friend || !this.canDrag(friend)) return;

    this.pointerId = event.pointerId;
    this.pointerPos = { x, y };
    this.selectedFriend = friend;
    friend.aiming = true;
    friend.dragPos = { x, y };
  }

  onPointerMove(event) {
    if (!this.selectedFriend || this.pointerId !== event.pointerId) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.scale;
    const y = (event.clientY - rect.top) / this.scale;

    this.pointerPos = { x, y };
    const friend = this.selectedFriend;
    const anchor = friend.anchor;
    const dx = x - anchor.x;
    const dy = y - anchor.y;
    const pull = Math.min(Math.hypot(dx, dy), 170);
    const angle = Math.atan2(dy, dx) || 0;
    friend.pullAmount = pull;
    friend.pullAngle = angle;
    friend.dragPos = {
      x: anchor.x + Math.cos(angle) * pull,
      y: anchor.y + Math.sin(angle) * pull,
    };
  }

  onPointerUp(event) {
    if (!this.selectedFriend || this.pointerId !== event.pointerId) return;

    const friend = this.selectedFriend;
    const anchor = friend.anchor;
    const dx = anchor.x - friend.dragPos.x;
    const dy = anchor.y - friend.dragPos.y;
    const pull = Math.hypot(dx, dy);

    friend.aiming = false;
    friend.dragPos = { ...anchor };
    friend.pullAmount = 0;
    friend.pullAngle = 0;
    this.pointerId = null;
    this.selectedFriend = null;

    if (pull < 8) {
      return;
    }

    const power = clamp(pull * 9.5, 0, 1600);
    const normX = dx / pull;
    const normY = dy / pull;
    friend.pos = { ...anchor };
    friend.vel.x = normX * power;
    friend.vel.y = normY * power;
    friend.isMoving = true;

    this.sound.play("launch");
    this.fx.addShake(4);

    this.shotsUsed += 1;
    this.updateShots();
  }

  findFriendAt(x, y) {
    for (let i = this.friends.length - 1; i >= 0; i -= 1) {
      const friend = this.friends[i];
      if (friend.removed) continue;
      const renderPos = friend.aiming ? friend.dragPos : friend.pos;
      const dx = x - renderPos.x;
      const dy = y - renderPos.y;
      if (Math.hypot(dx, dy) <= friend.radius * 1.25) {
        return friend;
      }
    }
    return null;
  }

  canDrag(friend) {
    if (friend.removed || friend.aiming) return false;
    const speed = Math.hypot(friend.vel.x, friend.vel.y);
    return speed < 25;
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.033);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    this.animation = requestAnimationFrame((time) => this.loop(time));
  }

  update(dt) {
    if (this.spawnGrace > 0) {
      this.spawnGrace = Math.max(0, this.spawnGrace - dt);
    }
    this.friends.forEach((friend) => {
      if (friend.removed || friend.aiming) return;
      this.integrateFriend(friend, dt);
      this.handleBounds(friend);
      this.handleScatterWalls(friend);
      this.handleBumpers(friend);
    });

    this.handleFriendCollisions();
    this.updateEffects(dt);

    if (!this.levelComplete && this.isLevelCleared()) {
      this.finishLevel(true);
    }

    if (
      !this.levelComplete &&
      this.shotsUsed >= this.level.shots &&
      !this.isLevelCleared() &&
      this.allFriendsIdle()
    ) {
      this.finishLevel(false);
    }
  }

  integrateFriend(friend, dt) {
    friend.pos.x += friend.vel.x * dt;
    friend.pos.y += friend.vel.y * dt;

    friend.vel.x *= 0.985;
    friend.vel.y *= 0.985;

    const speed = Math.hypot(friend.vel.x, friend.vel.y);
    if (speed < 12) {
      friend.vel.x = 0;
      friend.vel.y = 0;
      friend.isMoving = false;
    } else {
      friend.isMoving = true;
    }
  }

  handleBounds(friend) {
    const radius = friend.radius;

    if (friend.pos.x - radius < 0) {
      friend.pos.x = radius;
      friend.vel.x *= -0.85;
      if (this.spawnGrace <= 0) {
        this.fx.addShake(4);
        this.sound.play("hit");
      }
    } else if (friend.pos.x + radius > VIRTUAL_WIDTH) {
      friend.pos.x = VIRTUAL_WIDTH - radius;
      friend.vel.x *= -0.85;
      if (this.spawnGrace <= 0) {
        this.fx.addShake(4);
        this.sound.play("hit");
      }
    }

    if (friend.pos.y - radius < 0) {
      friend.pos.y = radius;
      friend.vel.y *= -0.82;
      if (this.spawnGrace <= 0) {
        this.fx.addShake(5);
        this.sound.play("hit");
      }
    } else if (friend.pos.y + radius > VIRTUAL_HEIGHT) {
      friend.pos.y = VIRTUAL_HEIGHT - radius;
      friend.vel.y *= -0.82;
      if (this.spawnGrace <= 0) {
        this.fx.addShake(5);
        this.sound.play("hit");
      }
    }
  }

  handleScatterWalls(friend) {
    this.level.walls.forEach((rect) => {
      const collision = this.circleRectCollision(friend.pos, friend.radius, rect);
      if (!collision) return;

      friend.pos.x += collision.normal.x * collision.depth;
      friend.pos.y += collision.normal.y * collision.depth;

      const dot =
        friend.vel.x * collision.normal.x + friend.vel.y * collision.normal.y;
      friend.vel.x -= 2 * dot * collision.normal.x;
      friend.vel.y -= 2 * dot * collision.normal.y;
      friend.vel.x *= rect.bounce || 0.96;
      friend.vel.y *= rect.bounce || 0.96;

      if (this.spawnGrace <= 0) {
        this.fx.addShake(3.5);
        this.sound.play("hit");
      }
    });
  }

  handleBumpers(friend) {
    this.level.bumpers.forEach((rect) => {
      const collision = this.circleRectCollision(friend.pos, friend.radius, rect);
      if (!collision) return;

      friend.pos.x += collision.normal.x * collision.depth;
      friend.pos.y += collision.normal.y * collision.depth;

      const dot =
        friend.vel.x * collision.normal.x + friend.vel.y * collision.normal.y;
      friend.vel.x -= 2 * dot * collision.normal.x;
      friend.vel.y -= 2 * dot * collision.normal.y;
      friend.vel.x *= rect.bounce || 1.0;
      friend.vel.y *= rect.bounce || 1.0;

      if (this.spawnGrace <= 0) {
        this.fx.addShake(6);
        this.sound.play("hit");
      }
    });
  }

  circleRectCollision(circlePos, radius, rect) {
    const closestX = clamp(circlePos.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
    const closestY = clamp(circlePos.y, rect.y - rect.h / 2, rect.y + rect.h / 2);

    const dx = circlePos.x - closestX;
    const dy = circlePos.y - closestY;
    const distanceSq = dx * dx + dy * dy;
    const radiusSq = radius * radius;

    if (distanceSq > radiusSq) return null;

    const distance = Math.sqrt(distanceSq) || 0.0001;
    const depth = radius - distance;
    return {
      normal: { x: dx / distance, y: dy / distance },
      depth,
    };
  }

  handleFriendCollisions() {
    for (let i = 0; i < this.friends.length; i += 1) {
      const a = this.friends[i];
      if (a.removed || a.aiming) continue;
      for (let j = i + 1; j < this.friends.length; j += 1) {
        const b = this.friends[j];
        if (b.removed || b.aiming) continue;

        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;
        if (distSq >= minDist * minDist) continue;

        if (a.color === b.color) {
          this.combineFriends(a, b);
          continue;
        }

        const dist = Math.sqrt(distSq) || 0.0001;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;

        a.pos.x -= nx * overlap * 0.5;
        a.pos.y -= ny * overlap * 0.5;
        b.pos.x += nx * overlap * 0.5;
        b.pos.y += ny * overlap * 0.5;

        const relVelX = b.vel.x - a.vel.x;
        const relVelY = b.vel.y - a.vel.y;
        const relSpeed = relVelX * nx + relVelY * ny;

        if (relSpeed < 0) {
          const impulse = -(1.1) * relSpeed;
          const impulseX = impulse * nx;
          const impulseY = impulse * ny;

          a.vel.x -= impulseX;
          a.vel.y -= impulseY;
          b.vel.x += impulseX;
          b.vel.y += impulseY;
        }

        a.isMoving = true;
        b.isMoving = true;
        this.fx.addShake(3);
        this.sound.play("hit");
      }
    }
  }

  combineFriends(a, b) {
    a.removed = true;
    b.removed = true;
    a.vel.x = 0;
    a.vel.y = 0;
    b.vel.x = 0;
    b.vel.y = 0;
    this.fx.addShake(10);
    if (this.spawnGrace <= 0) {
      this.sound.play("target");
    }

    const centerX = (a.pos.x + b.pos.x) / 2;
    const centerY = (a.pos.y + b.pos.y) / 2;
    const color = COLORS[a.color] || "#ffffff";

    this.effects.push({
      x: centerX,
      y: centerY,
      color,
      radius: Math.max(a.radius, b.radius) * 2.1,
      life: 0.6,
      maxLife: 0.6,
    });
  }

  updateEffects(dt) {
    this.effects.forEach((effect) => {
      effect.life -= dt;
    });
    this.effects = this.effects.filter((effect) => effect.life > 0);
  }

  isLevelCleared() {
    return this.friends.every((friend) => friend.removed);
  }

  allFriendsIdle() {
    return this.friends.every((friend) => friend.removed || (!friend.aiming && !friend.isMoving));
  }

  calculateStars() {
    if (!this.level.starGoals) return 3;
    if (this.shotsUsed <= this.level.starGoals.three) return 3;
    if (this.shotsUsed <= this.level.starGoals.two) return 2;
    if (this.shotsUsed <= this.level.starGoals.one) return 1;
    return 1;
  }

  finishLevel(success) {
    this.levelComplete = true;
    levelCompleteEl.classList.add("visible");

    if (success) {
      const stars = this.calculateStars();
      levelCompleteMessage.textContent = `Everyone's out! Shots used: ${this.shotsUsed}.`;
      levelCompleteStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
      starEls.forEach((el, index) => {
        el.classList.toggle("active", index < stars);
      });
    } else {
      levelCompleteMessage.textContent = "Out of shots! Give the crew another go.";
      levelCompleteStars.textContent = "☆☆☆";
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.scale(this.scale, this.scale);

    this.drawBackground(ctx);
    this.fx.apply(ctx);
    this.drawWalls(ctx);
    this.drawBumpers(ctx);
    this.drawSlingHint(ctx);
    this.drawEffects(ctx);

    this.friends.forEach((friend) => {
      if (friend.removed) return;
      this.drawFriend(ctx, friend);
    });

    ctx.restore();
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    gradient.addColorStop(0, "#0b292e");
    gradient.addColorStop(1, "#02171b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.strokeStyle = "rgba(125, 246, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let y = 40; y < VIRTUAL_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIRTUAL_WIDTH, y);
      ctx.stroke();
    }
  }

  drawBumpers(ctx) {
    this.level.bumpers.forEach((bumper) => {
      ctx.save();
      ctx.translate(bumper.x, bumper.y);
      ctx.fillStyle = "rgba(125, 246, 255, 0.18)";
      ctx.strokeStyle = "rgba(125, 246, 255, 0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-bumper.w / 2, -bumper.h / 2, bumper.w, bumper.h);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  drawWalls(ctx) {
    this.level.walls.forEach((wall) => {
      ctx.save();
      ctx.translate(wall.x, wall.y);
      ctx.fillStyle = "rgba(43, 120, 116, 0.45)";
      ctx.strokeStyle = "rgba(109, 255, 221, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(-wall.w / 2, -wall.h / 2, wall.w, wall.h);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  drawSlingHint(ctx) {
    if (!this.level.slingHint) return;
    const sling = this.level.slingHint;
    ctx.strokeStyle = "rgba(125, 246, 255, 0.3)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sling.x - 26, sling.y + 44);
    ctx.lineTo(sling.x, sling.y);
    ctx.lineTo(sling.x + 26, sling.y + 44);
    ctx.stroke();
  }

  drawFriend(ctx, friend) {
    const renderPos = friend.aiming ? friend.dragPos : friend.pos;
    const color = COLORS[friend.color] || "#ffffff";
    const roster = friend.roster || FRIEND_ROSTER[0];

    if (friend.aiming) {
      ctx.strokeStyle = `${color}80`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(friend.anchor.x, friend.anchor.y);
      ctx.lineTo(renderPos.x, renderPos.y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(renderPos.x, renderPos.y);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, friend.radius * 1.6);
    glow.addColorStop(0, `${color}`);
    glow.addColorStop(1, `${color}00`);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, friend.radius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    const velocity = Math.hypot(friend.vel.x, friend.vel.y);
    const pullStretch = friend.aiming
      ? clamp(friend.pullAmount / 120, 0, 0.55)
      : clamp(velocity / 650, 0, 0.4);
    const stretch = 1 + pullStretch;
    const squash = Math.max(0.55, 1 - pullStretch * 0.45);
    let angle = 0;
    if (friend.aiming && friend.pullAmount > 8) {
      angle = (friend.pullAngle || 0) + Math.PI;
    } else {
      if (velocity > 30) {
        angle = Math.atan2(friend.vel.y, friend.vel.x);
      }
    }

    ctx.save();
    ctx.rotate(angle);
    const idleFlip =
      !friend.aiming && velocity < 20
        ? friend.faceFlip
        : 1;
    ctx.scale(stretch * idleFlip, squash);

    // ears
    ctx.fillStyle = roster.stripe;
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.55, -friend.radius * 1.05, friend.radius * 0.42, friend.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.55, -friend.radius * 1.05, friend.radius * 0.42, friend.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = roster.accent;
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.55, -friend.radius * 1.05, friend.radius * 0.24, friend.radius * 0.32, 0, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.55, -friend.radius * 1.05, friend.radius * 0.24, friend.radius * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // body base
    ctx.fillStyle = roster.primary;
    ctx.beginPath();
    ctx.ellipse(0, 0, friend.radius, friend.radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // side stripes
    ctx.fillStyle = roster.stripe;
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.52, -friend.radius * 0.1, friend.radius * 0.35, friend.radius * 0.75, 0.25, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.52, -friend.radius * 0.1, friend.radius * 0.35, friend.radius * 0.75, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // face mask
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -friend.radius * 0.1, friend.radius * 0.85, friend.radius * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    // belly
    ctx.fillStyle = roster.belly;
    ctx.beginPath();
    ctx.ellipse(0, friend.radius * 0.35, friend.radius * 0.6, friend.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // cheeks
    ctx.fillStyle = `${color}aa`;
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.45, friend.radius * 0.05, friend.radius * 0.32, friend.radius * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.45, friend.radius * 0.05, friend.radius * 0.32, friend.radius * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = roster.eye;
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.28, -friend.radius * 0.18, friend.radius * 0.2, friend.radius * 0.26, 0, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.28, -friend.radius * 0.18, friend.radius * 0.2, friend.radius * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-friend.radius * 0.2, -friend.radius * 0.28, friend.radius * 0.09, friend.radius * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(friend.radius * 0.2, -friend.radius * 0.28, friend.radius * 0.09, friend.radius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // nose
    ctx.fillStyle = roster.nose;
    ctx.beginPath();
    ctx.ellipse(0, 0, friend.radius * 0.22, friend.radius * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // smile
    ctx.strokeStyle = roster.nose;
    ctx.lineWidth = Math.max(2, friend.radius * 0.12);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, friend.radius * 0.05, friend.radius * 0.35, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.restore();

    if (!friend.isMoving && !friend.aiming) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = `${color}66`;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, friend.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawEffects(ctx) {
    this.effects.forEach((effect) => {
      const progress = effect.life / effect.maxLife;
      ctx.globalAlpha = progress;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1 + (1 - progress) * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
}

// eslint-disable-next-line no-new
new Game(canvas);
