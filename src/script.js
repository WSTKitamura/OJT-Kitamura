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
      throw new Error($, { respon, sestatus } - $, { errorText });
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
}
