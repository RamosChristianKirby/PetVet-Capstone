import { FormEvent, useState } from "react";
import { useSettings } from "../../hooks/use-settings";
import { useAuth } from "../../hooks/use-auth";
import { api, errorMessage } from "../../lib/api";
import { saveProfile } from "../../lib/session";
import type { User } from "../../lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ErrorNotice } from "../shared/Page";
export function SettingsModal() {
  const settings = useSettings();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess(false);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { data } = await api.put<User>("/users/" + user?.id, values);
      saveProfile(data);
      setSuccess(true);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={settings.isOpen}
      onOpenChange={(open) => {
        if (!open && !busy) {
          settings.onClose();
          setError("");
          setSuccess(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My profile</DialogTitle>
          <DialogDescription>
            Manage the contact information for your account.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <form className="modal-form" onSubmit={submit}>
            <label className="field">
              Full name
              <input
                name="name"
                defaultValue={user.name}
                required
                maxLength={120}
              />
            </label>
            <label className="field">
              Email
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                maxLength={254}
              />
            </label>
            <label className="field">
              Contact number
              <input
                name="contact"
                type="tel"
                defaultValue={user.contact}
                required
              />
            </label>
            <label className="field">
              Address
              <textarea
                name="address"
                defaultValue={user.address}
                required
                maxLength={500}
              />
            </label>
            <p className="muted text-sm">
              Pet recovery details are saved separately. Update them in each
              pet’s profile when needed.
            </p>
            {error && <ErrorNotice message={error} />}
            {success && (
              <p className="notice success" role="status">
                Your profile has been updated.
              </p>
            )}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
