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
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  let colorHue = 0;

  function animate() {
    requestAnimationFrame(animate);

    // ライトの色をHSVで変化
    colorHue += 0.005;
    if (colorHue > 1) colorHue = 0;
    pointLight.color.setHSL(colorHue, 1, 0.5);

    cubes.forEach((cube, i) => {
      cube.rotation.x += 0.01 + i * 0.0005;
      cube.rotation.y += 0.01 + i * 0.0007;
    });

    renderer.render(scene, camera);
  }
  animate();

  const rotationSpeeds = cubes.map(() => ({
    x: 0.01 + Math.random() * 0.02, // 0.01〜0.03の範囲
    y: 0.01 + Math.random() * 0.02,
  }));

  function animate() {
    requestAnimationFrame(animate);

    cubes.forEach((cube, i) => {
      cube.rotation.x += rotationSpeeds[i].x;
      cube.rotation.y += rotationSpeeds[i].y;
    });

    renderer.render(scene, camera);
  }
  animate();

  // 各立方体に移動オフセットを持たせる（初期値は0）
  const moveOffsets = cubes.map(() => ({
    x: 0,
    y: 0,
    z: 0,
    xSpeed: (Math.random() - 0.5) * 0.002, // ゆっくり動く
    ySpeed: (Math.random() - 0.5) * 0.002,
    zSpeed: (Math.random() - 0.5) * 0.002,
  }));

  function animate() {
    requestAnimationFrame(animate);

    cubes.forEach((cube, i) => {
      // 回転
      cube.rotation.x += rotationSpeeds[i].x;
      cube.rotation.y += rotationSpeeds[i].y;

      // 位置のゆらぎ
      moveOffsets[i].x += moveOffsets[i].xSpeed;
      moveOffsets[i].y += moveOffsets[i].ySpeed;
      moveOffsets[i].z += moveOffsets[i].zSpeed;

      // 元の位置に対してゆらぎを加算
      cube.position.x += moveOffsets[i].xSpeed;
      cube.position.y += moveOffsets[i].ySpeed;
      cube.position.z += moveOffsets[i].zSpeed;

      // 動きすぎないように制限（±0.2の範囲で動く）
      if (Math.abs(moveOffsets[i].x) > 0.2)
        moveOffsets[i].xSpeed = -moveOffsets[i].xSpeed;
      if (Math.abs(moveOffsets[i].y) > 0.2)
        moveOffsets[i].ySpeed = -moveOffsets[i].ySpeed;
      if (Math.abs(moveOffsets[i].z) > 0.2)
        moveOffsets[i].zSpeed = -moveOffsets[i].zSpeed;
    });

    renderer.render(scene, camera);
  }
  animate();
}
