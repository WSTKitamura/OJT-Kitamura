const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

// ▼ 1. 画像プレビュー機能
input.addEventListener("change", () => {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ▼ 2. 画像を Azure Functions に送信して検索
async function uploadAndSearch() {
  const file = input.files[0];
  if (!file) {
    alert("画像を選択してください。");
    return;
  }

  status.textContent = "検索中...";

  try {
    // Azure Functions のエンドポイントに送信
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
      throw new Error(`HTTP エラー: ${response.status}`);
    }

    const result = await response.json();

    // ▼ 仮：似た画像のURLリスト（OpenAIで検索した結果に置き換える）
    const similarImages = result.similarImages || [
      "https://via.placeholder.com/200x200?text=Image+1",
      "https://via.placeholder.com/200x200?text=Image+2",
      "https://via.placeholder.com/200x200?text=Image+3",
      "https://via.placeholder.com/200x200?text=Image+4",
      "https://via.placeholder.com/200x200?text=Image+5",
      "https://via.placeholder.com/200x200?text=Image+6",
    ];

    // ▼ ローカルストレージに保存して次のページへ
    localStorage.setItem("similarImages", JSON.stringify(similarImages));
    window.location.href = "results.html";
  } catch (err) {
    status.textContent = "検索に失敗しました: " + err.message;
  }
}
