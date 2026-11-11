import type { Session, User } from "./types";
const keys = ["token", "userDetails", "userName", "userEmail", "userId"];

export function tokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}
export function readUser(): User | null {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("userDetails") || "null");
    return token && tokenExpiry(token) > Date.now() && user?.id && user?.name
      ? user
      : null;
  } catch {
    return null;
  }
}
export function saveSession(session: Session) {
  localStorage.setItem("token", session.token);
  saveProfile(session.result);
}
export function saveProfile(user: User) {
  localStorage.setItem("userDetails", JSON.stringify(user));
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userId", user.id || user._id);
  window.dispatchEvent(new Event("petvet:session"));
}
export function clearSession() {
  keys.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("petvet:session"));
}
