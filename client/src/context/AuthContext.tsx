import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, errorMessage } from "../lib/api";
import {
  clearSession,
  readUser,
  saveProfile,
  tokenExpiry,
} from "../lib/session";
import type { User } from "../lib/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  retry: () => void;
  logout: () => void;
  setIsAuthenticated: (value: boolean) => void;
}
// The provider and its context share a module; consumers use the useAuth hook.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const sync = () => {
      setUser(readUser());
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("petvet:session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("petvet:session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (!token || tokenExpiry(token) <= Date.now()) {
      if (token) clearSession();
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get<User>("/users/me", { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          saveProfile(data);
          setUser(data);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    const timer = window.setTimeout(
      clearSession,
      Math.min(tokenExpiry(token) - Date.now(), 2147483647),
    );
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [token, revision]);
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        error,
        retry,
        logout: clearSession,
        setIsAuthenticated: (value) =>
          value ? setUser(readUser()) : clearSession(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
