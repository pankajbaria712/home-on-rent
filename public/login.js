function val(id) {
  return document.getElementById(id).value.trim();
}
const msg = (t) => (document.getElementById("msg").textContent = t || "");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signup").addEventListener("click", async () => {
    try {
      const email = val("email"),
        password = val("password");
      const role = val("role"),
        phone = val("phone");
      if (!email || !password || !phone) return msg("Fill all fields.");
      await auth.createUserWithEmailAndPassword(email, password);
      await api("/api/users/init", { method: "POST", body: { role, phone } });
      msg("Signed up! Redirecting...");
      setTimeout(
        () =>
          (location.href = role === "owner" ? "/owner-dashboard.html" : "/"),
        600
      );
    } catch (e) {
      msg(e.message);
    }
  });

  document.getElementById("signin").addEventListener("click", async () => {
    try {
      const email = val("email"),
        password = val("password");
      if (!email || !password) return msg("Enter email & password.");
      await auth.signInWithEmailAndPassword(email, password);
      const me = await api("/api/users/me").catch(() => ({ user: null }));
      msg("Signed in!");
      setTimeout(
        () =>
          (location.href =
            me.user && me.user.role === "owner"
              ? "/owner-dashboard.html"
              : "/"),
        400
      );
    } catch (e) {
      msg(e.message);
    }
  });

  document.getElementById("reset").addEventListener("click", async () => {
    const email = val("email");
    if (!email) return msg("Enter your registered email first.");
    await auth.sendPasswordResetEmail(email);
    msg("Password reset email sent.");
  });
});
