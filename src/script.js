const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const button = document.getElementById("uploadButton");
const material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(Math.random(), Math.random(), Math.random()),
  roughness: 0.3,
  metalness: 0.6,
  reflectivity: 0.5,
  clearcoat: 0.2,
});
const pmremGenerator = new THREE.PMREMGenerator(renderer);
new THREE.RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load('path/to/your_envmap.hdr', function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    scene.background = envMap;
    texture.dispose();
    pmremGenerator.dispose();
  });

const textureLoader = new THREE.TextureLoader();
const normalMap = textureLoader.load('path/to/normal_map.jpg');

const blockMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.4,
  normalMap: normalMap,
});
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

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
      throw new Error(${response.status} - ${errorText});
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
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  let colorHue = 0;
  const obstacleGroup = new THREE.Group();
scene.add(obstacleGroup);

// テクスチャロード（オプション）
const textureLoader = new THREE.TextureLoader();
const blockTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg');

// 高品質なブロック生成
function createHighQualityBlock() {
  const geometry = new THREE.BoxGeometry(
    0.4 + Math.random() * 0.4, // 幅にバリエーション
    0.5 + Math.random() * 0.5, // 高さ
    0.4 + Math.random() * 0.4  // 奥行き
  );

  const material = new THREE.MeshStandardMaterial({
    map: blockTexture,         // テクスチャでリアルな壁感
    roughness: 0.3,            // 少しツヤ感
    metalness: 0.2,            // 少し金属感（反射）
    color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5), // 色に変化
  });

  const block = new THREE.Mesh(geometry, material);
  block.castShadow = true;
  block.receiveShadow = true;

  block.position.set(
    6,
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 2
  );

  block.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  return block;
}
}