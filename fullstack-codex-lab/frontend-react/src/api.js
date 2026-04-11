const BASE_URL = "http://localhost:5200";

const safeParse = async (response) => {
  if (!response) {
    return null;
  }

  const text = await response.text().catch(() => "");
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await safeParse(response);

  if (!response.ok) {
    const message =
      payload?.error
      ?? payload?.message
      ?? (typeof payload === "string" ? payload : response.statusText);
    throw new Error(message);
  }

  return payload;
};

export const loginUser = (credentials) =>
  request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

export const registerUser = (credentials) =>
  request("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

export const fetchCurrentUser = (token) => {
  if (!token) {
    throw new Error("Missing authentication token.");
  }

  return request("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
