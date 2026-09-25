// Simple client-side SHA-256 hashing using the built-in Web Crypto API.
// Used so passwords are never stored in plain text in localStorage.
export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
