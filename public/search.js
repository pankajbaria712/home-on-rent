async function render(items) {
  const box = document.getElementById("results");
  box.innerHTML = "";
  if (!items.length) {
    box.innerHTML = "<p>No properties found.</p>";
    return;
  }
  for (const p of items) {
    const div = document.createElement("div");
    div.className = "card property-card";
    const img =
      p.images && p.images[0]
        ? p.images[0]
        : "https://picsum.photos/400/260?blur=2";
    div.innerHTML = `
      <img src="${img}" alt="property"/>
      <h3>${p.title}</h3>
      <p>${p.city} • ${p.type.toUpperCase()}</p>
      <p><strong>₹${p.rent}</strong>/month</p>
      <a href="/property.html?id=${p._id}">View details →</a>
    `;
    box.appendChild(div);
  }
}

async function search() {
  const params = new URLSearchParams();
  const city = document.getElementById("city").value.trim();
  const type = document.getElementById("type").value;
  const minRent = document.getElementById("minRent").value;
  const maxRent = document.getElementById("maxRent").value;
  if (city) params.set("city", city);
  if (type) params.set("type", type);
  if (minRent) params.set("minRent", minRent);
  if (maxRent) params.set("maxRent", maxRent);
  const data = await fetch("/api/properties?" + params.toString()).then((r) =>
    r.json()
  );
  render(data.items || []);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn").addEventListener("click", search);
  document.getElementById("clearBtn").addEventListener("click", () => {
    ["city", "type", "minRent", "maxRent"].forEach((id) => {
      const el = document.getElementById(id);
      if (el.tagName === "SELECT") el.value = "";
      else el.value = "";
    });
    search();
  });
  search(); // initial load
});
