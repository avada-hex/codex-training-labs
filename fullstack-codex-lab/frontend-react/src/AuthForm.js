import React, { useMemo, useState } from "react";
import { loginUser, registerUser } from "./api";

const MIN_USERID_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

function AuthForm({ onSuccess, disabled = false }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedUserId = userId.trim();
  const isRegisterMode = mode === "register";
  const isValidForm =
    trimmedUserId.length >= MIN_USERID_LENGTH &&
    password.length >= MIN_PASSWORD_LENGTH;

  const buttonLabel = useMemo(() => {
    if (isRegisterMode) {
      return isSubmitting ? "Creating account…" : "Create account";
    }
    return isSubmitting ? "Signing in…" : "Sign in";
  }, [isRegisterMode, isSubmitting]);

  const helpCopy = isRegisterMode
    ? "Pick a unique user ID (>= 3 characters) and a password (>= 6 characters)."
    : "Existing accounts: alice / Pa$$word123 or bob / S3cure#456.";

  const toggleMode = (nextMode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidForm) {
      setError(
        `User ID needs at least ${MIN_USERID_LENGTH} characters and password at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const action = isRegisterMode ? registerUser : loginUser;
      const payload = await action({
        userId: trimmedUserId,
        password
      });

      const defaultSuccess =
        isRegisterMode ? "Account created and authenticated." : "Signed in successfully.";
      const successMessage = payload?.message ?? defaultSuccess;

      setSuccess(successMessage);
      onSuccess?.(payload);
      setPassword("");
    } catch (err) {
      setError(err?.message ?? "Unable to authenticate. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="mode-tabs" role="tablist">
        {["login", "register"].map((tab) => (
          <button
            type="button"
            key={tab}
            role="tab"
            aria-selected={mode === tab}
            className={`mode-tab ${mode === tab ? "active" : ""}`}
            onClick={() => toggleMode(tab)}
            disabled={isSubmitting || disabled}
          >
            {tab === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      <label className="input-label">
        User ID
        <input
          type="text"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          autoComplete="username"
          disabled={isSubmitting || disabled}
          placeholder="e.g., your-handle"
        />
      </label>
      <label className="input-label">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegisterMode ? "new-password" : "current-password"}
          disabled={isSubmitting || disabled}
          placeholder="••••••••"
        />
      </label>

      <p className="form-hint">{helpCopy}</p>

      {success && (
        <p className="success-note" role="status">
          {success}
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="action-button"
        disabled={isSubmitting || disabled}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export default AuthForm;
