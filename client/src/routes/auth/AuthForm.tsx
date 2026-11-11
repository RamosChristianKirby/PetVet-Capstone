import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { saveSession } from "../../lib/session";
import type { Session } from "../../lib/types";
import useAuthRedirect from "../../hooks/use-auth-redirect";
import { ErrorNotice } from "../../components/shared/Page";
import AuthLayout from "./Layout";

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  useAuthRedirect();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (signup && fields.password !== fields.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post<Session>(
        "/users/" + (signup ? "signup" : "login"),
        fields,
      );
      saveSession(data);
      const from = location.state?.from;
      navigate(
        typeof from === "string" && from.startsWith("/dashboard")
          ? from
          : "/dashboard",
        { replace: true },
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout title={signup ? "Make care a little closer." : "Welcome back."}>
      <p className="muted auth-description">
        {signup
          ? "Create your pet owner account and give every companion a connected home."
          : "Sign in to your PetVet workspace."}
      </p>
      <form className="auth-form" onSubmit={submit}>
        {signup && (
          <label className="field">
            Full name
            <input
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              placeholder="Your full name"
            />
          </label>
        )}
        <label className="field">
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        {signup && (
          <>
            <label className="field">
              Contact number
              <input
                name="contact"
                type="tel"
                required
                autoComplete="tel"
                placeholder="09XXXXXXXXX"
              />
              <small>Use 09XXXXXXXXX or +639XXXXXXXXX.</small>
            </label>
            <label className="field">
              Address
              <input
                name="address"
                required
                maxLength={500}
                autoComplete="street-address"
                placeholder="Street, barangay, city"
              />
            </label>
          </>
        )}
        <label className="field">
          Password
          <div className="password-field">
            <input
              name="password"
              type={visible ? "text" : "password"}
              required
              minLength={signup ? 8 : 1}
              maxLength={72}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? "At least 8 characters" : "Your password"}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {signup && (
          <label className="field">
            Confirm password
            <input
              name="confirmPassword"
              type={visible ? "text" : "password"}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
            />
          </label>
        )}
        {error && <ErrorNotice message={error} />}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Please wait…" : signup ? "Create my account" : "Sign in"}
        </button>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to PetVet?"}{" "}
          <Link to={signup ? "/auth/login" : "/auth/signup"}>
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
