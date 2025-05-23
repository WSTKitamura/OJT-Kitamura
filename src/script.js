const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let playerY = canvas.height / 2;
let velocity = 0;
let gravity = 0.5;
let isSpacePressed = false;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    isSpacePressed = true;
    velocity = -8; // 上にジャンプする力
  }
});

function update() {
  if (isSpacePressed) {
    velocity += gravity;
    playerY += velocity;

    if (playerY > canvas.height - 20) {
      // 床に着いたら
      playerY = canvas.height - 20;
      velocity = 0;
      isSpacePressed = false;
    }

    if (playerY < 20) {
      // 天井に当たったら
      playerY = 20;
      velocity = 0;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(50, playerY, 15, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
