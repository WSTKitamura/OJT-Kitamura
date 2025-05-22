async function uploadAndSearch() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://YOUR_FUNCTION_URL/api/searchSimilar", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  result.similarImages.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "200px";
    resultsDiv.appendChild(img);
  });
}
