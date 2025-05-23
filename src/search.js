const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const button = document.getElementById("uploadButton");
const searchStatus = document.getElementById("searchStatus");

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

button.addEventListener("click", async () => {
  const file = input.files[0];
  if (!file) {
    alert("画像を選択してください。");
    return;
  }

  searchStatus.textContent = "検索中...";
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
    // ここで結果を扱う（例：localStorage保存、結果ページへ移動など）
    localStorage.setItem(
      "similarImages",
      JSON.stringify(result.similarImages || [])
    );
    searchStatus.textContent = "検索完了、結果ページへ移動します。";

    // 検索結果ページへ遷移
    window.location.href = "results.html";
  } catch (err) {
    searchStatus.textContent = "検索に失敗しました: " + err.message;
  } finally {
    button.disabled = false;
  }
});
