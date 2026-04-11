const AUTH_ENDPOINT = "http://localhost:5000/login";
const form = document.getElementById("auth-form");
const statusEl = document.getElementById("status");
const submitButton = form.querySelector("button[type=submit]");

const setStatus = (message, state = "info") => {
  if (!message) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.dataset.state = "";
    return;
  }
  statusEl.textContent = message;
  statusEl.dataset.state = state;
  statusEl.hidden = false;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userId = form.userId.value.trim();
  const password = form.password.value;
  setStatus("Signing in...", "info");
  submitButton.disabled = true;

  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password })
    });
    const payload = await response.json();
    if (response.ok) {
      setStatus(payload.message, "success");
    } else {
      setStatus(payload.error || "Sign in failed.", "error");
    }
  } catch (error) {
    setStatus("Unable to reach the backend.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

setStatus("");
