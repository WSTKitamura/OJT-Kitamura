const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const button = document.getElementById("uploadButton");
const cubeVelocities = [];

const material = new THREE.MeshStandardMaterial({
  color: new THREE.Color(Math.random(), Math.random(), Math.random()),
  emissive: new THREE.Color(Math.random(), Math.random(), Math.random()),
  emissiveIntensity: 0.8,
  metalness: 0.3,
  roughness: 0.4,
});

let pulse = 0;
function animate() {
  requestAnimationFrame(animate);
  pulse = Math.abs(Math.sin(Date.now() * 0.001));
  cubes.forEach((cube, i) => {
    cube.rotation.x += 0.01 + i * 0.0005;
    cube.rotation.y += 0.01 + i * 0.0007;
    cube.material.emissiveIntensity = 0.3 + 0.7 * pulse;
  });
  renderer.render(scene, camera);
}

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
      throw new Error(
        `ステータス: ${response.status}, メッセージ: ${errorText}`
      );
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
