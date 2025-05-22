const input = document.getElementById("imageInput");
const resultsDiv = document.getElementById("results");

// 画像表示用のimg要素を作る
const preview = document.createElement("img");
preview.style.maxWidth = "300px";
preview.style.marginTop = "10px";
input.parentNode.insertBefore(preview, resultsDiv);

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result; // 選択した画像のデータURLをセット
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
});

async function uploadAndSearch() {
  if (input.files.length === 0) {
    alert("画像を選択してください");
    return;
  }

  const file = input.files[0];
  resultsDiv.textContent = "検索中…";

  try {
    const response = await fetch(
      "https://brave-hill-0df254e00.6.azurestaticapps.net//api/imageToVector",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: file,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const data = await response.json();

    resultsDiv.innerHTML = `
      <h2>画像の特徴</h2>
      <p>${data.description}</p>
      <h3>ベクトル（最初の10要素）</h3>
      <pre>${data.embedding
        .slice(0, 10)
        .map((n) => n.toFixed(4))
        .join(", ")}</pre>
    `;
  } catch (err) {
    resultsDiv.textContent = `エラーが発生しました: ${err.message}`;
  }
}
