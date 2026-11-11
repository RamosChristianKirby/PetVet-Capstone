import { clearSession, readUser } from "../lib/session";
export const getUserDetails = () => ({
  name: readUser()?.name || "",
  email: readUser()?.email || "",
});
export const clearUserDetails = clearSession;
