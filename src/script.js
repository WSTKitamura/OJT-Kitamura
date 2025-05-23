// --- THREE.js 基本セットアップ ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 環境光・ライト ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- プレイヤー作成 ---
const playerGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.set(-3, 0, 0);

let playerY = 0;
const keyState = { ArrowUp: false, ArrowDown: false };

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    keyState[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    keyState[e.key] = false;
  }
});

// --- 障害物（ブロック）グループ ---
const obstacleGroup = new THREE.Group();
scene.add(obstacleGroup);

const textureLoader = new THREE.TextureLoader();
const blockTexture = textureLoader.load(
  "https://threejsfundamentals.org/threejs/resources/images/wall.jpg"
);
const normalMap = textureLoader.load("path/to/normal_map.jpg"); // 適切なパスに変更必須

// --- ブロック作成関数 ---
function createHighQualityBlock() {
  const geometry = new THREE.BoxGeometry(
    0.4 + Math.random() * 0.4,
    0.5 + Math.random() * 0.5,
    0.4 + Math.random() * 0.4
  );
  const material = new THREE.MeshStandardMaterial({
    map: blockTexture,
    roughness: 0.3,
    metalness: 0.2,
    normalMap: normalMap,
    color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
  });
  const block = new THREE.Mesh(geometry, material);
  block.castShadow = true;
  block.receiveShadow = true;
  block.position.set(6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
  block.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  return block;
}

function addBlock() {
  const block = createHighQualityBlock();
  obstacleGroup.add(block);
}

// --- ステータス表示 ---
const status = document.getElementById("status");

// --- ゲーム更新処理 ---
let lastTime = 0;
const fpsInterval = 1000 / 30; // 30fps

function update() {
  // プレイヤー移動目標更新
  if (keyState.ArrowUp) playerY += 0.1;
  if (keyState.ArrowDown) playerY -= 0.1;

  // プレイヤーY座標制限＆スムーズ移動
  playerY = Math.min(Math.max(playerY, -3), 3);
  player.position.y += (playerY - player.position.y) * 0.2;

  // ブロックを左へ移動
  obstacleGroup.children.forEach((block) => {
    block.position.x -= 0.03;
  });

  // 画面外ブロックを削除
  for (let i = obstacleGroup.children.length - 1; i >= 0; i--) {
    if (obstacleGroup.children[i].position.x < -6) {
      obstacleGroup.remove(obstacleGroup.children[i]);
    }
  }

  // 衝突判定（簡易）
  let collision = false;
  obstacleGroup.children.forEach((block) => {
    const dx = player.position.x - block.position.x;
    const dy = player.position.y - block.position.y;
    if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
      block.material.color.set(0xff0000);
      collision = true;
    } else {
      // 衝突していない時は元の色に戻す（例として白に）
      block.material.color.set(0xffffff);
    }
  });
  if (collision) {
    status.textContent = "衝突しました！";
    status.className = "error";
  } else {
    status.textContent = "";
    status.className = "";
  }

  // ランダムでブロック追加
  if (Math.random() < 0.02) addBlock();
}

// --- 描画処理 ---
function draw() {
  renderer.render(scene, camera);
}

// --- ゲームループ ---
function gameLoop(time) {
  if (!lastTime) lastTime = time;
  if (time - lastTime > fpsInterval) {
    lastTime = time;
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// --- 画像アップロード関連 ---
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const button = document.getElementById("uploadButton");

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

async function uploadAndSearch() {
  const file = input.files[0];
  if (!file) {
    alert("画像を選択してください。");
    return;
  }
  status.textContent = "検索中...";
  status.className = "";
  button.disabled = true;

  try {
    const response = await fetch(
      "https://brave-hill-0df254e00.6.azurestaticapps.net/api/imageToVector",
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const similarImages = result.similarImages || [];

    localStorage.setItem("similarImages", JSON.stringify(similarImages));
    status.textContent = "検索完了、結果ページへ移動します。";
    status.className = "success";
    window.location.href = "results.html";
  } catch (err) {
    status.textContent = "検索に失敗しました: " + err.message;
    status.className = "error";
  } finally {
    button.disabled = false;
  }
}
