// Firebase compat SDKs must be loaded via script tags in HTML
if (!window.firebaseConfig) {
  console.error(
    "Missing firebase-config.js. Copy firebase-config.example.js and fill values."
  );
}
firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();

async function getIdToken() {
  const u = auth.currentUser;
  if (!u) return null;
  return await u.getIdToken();
}

async function api(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = await getIdToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  if (!isFormData) headers["Content-Type"] = "application/json";
  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }
  return res.json();
}

function onAuthChange(cb) {
  auth.onAuthStateChanged(cb);
}
async function signOut() {
  await auth.signOut();
  location.reload();
}
