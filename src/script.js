// --- 初期セットアップ ---

// FPS制御用
let lastTime = 0;
const fpsInterval = 1000 / 30; // 30fps

// THREE.js シーン、カメラ、レンダラーは既にある前提です
// 例:
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(...);
// const renderer = new THREE.WebGLRenderer(...);

// プレイヤー作成
const playerGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.set(-3, 0, 0);

let playerY = 0;
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") playerY += 0.3;
  else if (e.key === "ArrowDown") playerY -= 0.3;
});

// ライト追加
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// 環境マップ読み込み (HDR)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
new THREE.RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load("path/to/your_envmap.hdr", function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    scene.background = envMap;
    texture.dispose();
    pmremGenerator.dispose();
  });

// テクスチャロード
const textureLoader = new THREE.TextureLoader();
const normalMap = textureLoader.load("path/to/normal_map.jpg");
const blockTexture = textureLoader.load(
  "https://threejsfundamentals.org/threejs/resources/images/wall.jpg"
);

// ブロック用素材
const blockMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.4,
  normalMap: normalMap,
});

// ブロック群グループ
const obstacleGroup = new THREE.Group();
scene.add(obstacleGroup);

// --- ゲームロジック ---

// ブロック生成関数
function createHighQualityBlock() {
  const geometry = new THREE.BoxGeometry(
    0.4 + Math.random() * 0.4, // 幅
    0.5 + Math.random() * 0.5, // 高さ
    0.4 + Math.random() * 0.4 // 奥行き
  );

  const material = new THREE.MeshStandardMaterial({
    map: blockTexture,
    roughness: 0.3,
    metalness: 0.2,
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

// 更新処理
function update() {
  // プレイヤー上下移動をスムーズに
  player.position.y += (playerY - player.position.y) * 0.2;

  // ブロックを左へ移動
  obstacleGroup.children.forEach((block) => {
    block.position.x -= 0.03;
  });

  // 画面外のブロック削除
  for (let i = obstacleGroup.children.length - 1; i >= 0; i--) {
    if (obstacleGroup.children[i].position.x < -6) {
      obstacleGroup.remove(obstacleGroup.children[i]);
    }
  }

  // 衝突判定（簡易版）
  let collided = false;
  obstacleGroup.children.forEach((block) => {
    const dx = player.position.x - block.position.x;
    const dy = player.position.y - block.position.y;
    if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
      block.material.color.set(0xff0000); // 衝突時赤く
      collided = true;
    } else {
      // 衝突していなければ元の色に戻す
      block.material.color.setHSL(Math.random(), 0.6, 0.5);
    }
  });

  if (collided) {
    status.textContent = "衝突しました！";
    status.className = "error";
  } else {
    status.textContent = "";
    status.className = "";
  }

  // ブロック追加確率
  if (Math.random() < 0.02) addBlock();
}

// 描画処理
function draw() {
  renderer.render(scene, camera);
}

// メインループ
function gameLoop(time) {
  if (time - lastTime > fpsInterval) {
    lastTime = time;
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// --- UI & アップロード処理 ---

const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
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
        headers: {
          "Content-Type": "application/octet-stream",
        },
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

button.addEventListener("click", uploadAndSearch);
