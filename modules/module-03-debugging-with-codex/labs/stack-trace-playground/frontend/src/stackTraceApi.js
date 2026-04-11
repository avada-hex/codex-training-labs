const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function explainStackTrace(stackTrace) {
  const response = await fetch(`${API_URL}/stack-trace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stackTrace })
  });

  if (!response.ok) {
    throw new Error("diagnostics service returned an error");
  }

  return response.json();
}
