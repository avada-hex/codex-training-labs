const AUTH_ENDPOINT = "http://localhost:5001/login";

const form = document.querySelector(".form");
const userIdInput = document.querySelector("#user-id");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("button[type='submit']");
const statusBox = document.querySelector(".status");
const buttonLabel = submitButton.textContent;

function setStatus(message) {
  statusBox.hidden = !message;
  statusBox.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Signing in...");
  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";

  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userIdInput.value,
        password: passwordInput.value
      })
    });

    const payload = await response.json();
    setStatus(response.ok ? payload.message : payload.error || "Sign in failed.");
  } catch (error) {
    setStatus("Unable to reach the backend.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = buttonLabel;
  }
});
