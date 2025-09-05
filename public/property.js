function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function renderGallery(images) {
  const box = document.getElementById("gallery");
  if (!images || !images.length) {
    box.innerHTML =
      '<img src="https://picsum.photos/900/500" alt="placeholder"/>';
    return;
  }
  let i = 0;
  const img = document.createElement("img");
  img.src = images[0];
  box.appendChild(img);
  const prev = document.createElement("div");
  const next = document.createElement("div");
  prev.textContent = "◀";
  next.textContent = "▶";
  prev.className = "nav prev";
  next.className = "nav next";
  prev.onclick = () => {
    i = (i - 1 + images.length) % images.length;
    img.src = images[i];
  };
  next.onclick = () => {
    i = (i + 1) % images.length;
    img.src = images[i];
  };
  box.appendChild(prev);
  box.appendChild(next);
}

async function load() {
  const id = qs("id");
  const data = await fetch("/api/properties/" + id).then((r) => r.json());
  const p = data.item;
  document.getElementById("title").textContent = p.title;
  document.getElementById("meta").textContent =
    p.city + " • " + p.type.toUpperCase() + " • ₹" + p.rent + "/month";
  document.getElementById("address").textContent = p.address;
  document.getElementById("amenities").textContent =
    (p.amenities || []).join(", ") || "—";
  renderGallery(p.images);

  document.getElementById("contactBtn").addEventListener("click", async () => {
    try {
      const res = await api("/api/properties/" + p._id + "/contact");
      document.getElementById("phone").textContent = "Owner: " + res.phone;
    } catch (e) {
      alert("Please login to view the phone number.");
      location.href = "/login.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", load);
