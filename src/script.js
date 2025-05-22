async function uploadAndSearch() {
  const input = document.getElementById("imageInput");
  const resultsDiv = document.getElementById("results");

  if (input.files.length === 0) {
    alert("画像を選択してください");
    return;
  }

  const file = input.files[0];

  try {
    resultsDiv.textContent = "検索中…";

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

    // 画面に結果を表示
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
