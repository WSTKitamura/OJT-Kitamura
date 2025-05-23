const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = {
  x: 50,
  y: 130,
  width: 20,
  height: 20,
  dy: 0, // Y方向の速度
};

let obstacles = []; // 障害物リスト
let frameCount = 0; // フレームカウンター
let gameOver = false;

const gravity = 0.5; // 重力（ジャンプ後の落下加速度）
const jumpStrength = -10; // ジャンプの初速（負の値で上方向へ）

// スペースキーでジャンプ
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !gameOver) {
    player.dy = jumpStrength;
  }
});

// 新しい障害物を生成する関数
function createObstacle() {
  const height = 30 + Math.random() * 40; // 30～70の高さの障害物
  obstacles.push({
    x: canvas.width,
    y: canvas.height - height,
    width: 20,
    height: height,
  });
}

// ゲーム状態の更新処理
function update() {
  if (gameOver) return;

  frameCount++;

  // プレイヤーの垂直方向の速度に重力を足してY座標を更新
  player.dy += gravity;
  player.y += player.dy;

  // 床（キャンバスの下端）にぶつかったら止める
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
  }

  // 90フレームに1回（約3秒に1回）障害物を作る
  if (frameCount % 90 === 0) {
    createObstacle();
  }

  // 障害物を左に移動
  obstacles.forEach((obs) => {
    obs.x -= 3;
  });

  // 画面外に出た障害物を削除
  obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);

  // 衝突判定（AABB判定）
  obstacles.forEach((obs) => {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
      document.getElementById("status").textContent =
        "ゲームオーバー！スペースキーでリスタート";
    }
  });
}

// 描画処理
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤーを水色で描く
  ctx.fillStyle = "deepskyblue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // 障害物を赤で描く
  ctx.fillStyle = "tomato";
  obstacles.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
}

// メインループ
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ゲームオーバー中にスペースキーを押すとリセット
document.addEventListener("keydown", (e) => {
  if (gameOver && e.code === "Space") {
    obstacles = [];
    player.y = 130;
    player.dy = 0;
    frameCount = 0;
    gameOver = false;
    document.getElementById("status").textContent = "";
  }
});

// ゲーム開始
loop();
