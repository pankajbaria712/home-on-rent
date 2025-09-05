function val(id) {
  return document.getElementById(id).value.trim();
}
const msg = (t) => (document.getElementById("msg").textContent = t || "");

function previewFiles(files) {
  const box = document.getElementById("preview");
  box.innerHTML = "";
  [...files].slice(0, 5).forEach((f) => {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    const card = document.createElement("div");
    card.className = "card";
    card.appendChild(img);
    box.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("images");
  input.addEventListener("change", () => previewFiles(input.files));

  document.getElementById("submit").addEventListener("click", async () => {
    try {
      const fd = new FormData();
      ["title", "address", "city", "type", "rent", "amenities"].forEach((id) =>
        fd.append(id, val(id))
      );
      const files = document.getElementById("images").files;
      if (files.length > 5) return msg("Max 5 images allowed.");
      for (let i = 0; i < files.length; i++) fd.append("images", files[i]);
      const res = await api("/api/properties", {
        method: "POST",
        body: fd,
        isFormData: true,
      });
      msg("Property added! View: /property.html?id=" + res.item._id);
      setTimeout(
        () => (location.href = "/property.html?id=" + res.item._id),
        600
      );
    } catch (e) {
      msg(e.message || "Failed to add property");
    }
  });
});
