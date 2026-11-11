import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, PawPrint } from "lucide-react";
import { api, errorMessage, refreshData } from "../../../lib/api";
import { useAuth } from "../../../hooks/use-auth";
import { useResource } from "../../../hooks/use-resource";
import { ErrorNotice, Page } from "../../../components/shared/Page";
import { today } from "../../../lib/dates";
import type { Pet, User } from "../../../lib/types";

export default function CreatePet() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const owners = useResource<User[]>(isDoctor ? "/users" : null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ownerId, setOwnerId] = useState("");
  const [kind, setKind] = useState("dog");
  const [contact, setContact] = useState(user?.contact || "");
  const [address, setAddress] = useState(user?.address || "");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post<Pet>("/pets", {
        ...values,
        petType: kind,
        ownerId: ownerId || user?.id,
      });
      refreshData();
      navigate("/dashboard/pets/" + data._id, { replace: true });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title="Meet your newest companion."
      description="Register their identity today. Keep their care connected for life."
      actions={
        <Link className="text-link" to="/dashboard/pets">
          <ArrowLeft size={16} />
          Back to registry
        </Link>
      }
    >
      <form onSubmit={submit} className="form-layout">
        <div className="panel form-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / THE BASICS</span>
              <h2>Pet information</h2>
            </div>
            <PawPrint className="muted" />
          </div>
          <div className="field-grid">
            <label className="field">
              Pet’s name
              <input
                name="name"
                required
                maxLength={120}
                placeholder="e.g. Mochi"
                autoComplete="off"
              />
            </label>
            <label className="field">
              Date of birth
              <input name="dob" type="date" required max={today()} />
            </label>
            <label className="field">
              Species
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>
            <label className="field">
              RFID number
              <input
                name="rfidNumber"
                required
                minLength={5}
                maxLength={64}
                pattern="[A-Za-z0-9-]{5,64}"
                placeholder="Scan or enter the tag number"
                autoComplete="off"
              />
              <small>
                5–64 letters, numbers, or hyphens. Keep leading zeros.
              </small>
            </label>
            <label className="field">
              Primary breed
              <input
                name="breed1"
                required
                maxLength={120}
                placeholder={
                  kind === "dog"
                    ? "e.g. Aspin or Labrador"
                    : "e.g. Puspin or Siamese"
                }
              />
            </label>
            <label className="field">
              Secondary breed <span className="optional">Optional</span>
              <input
                name="breed2"
                maxLength={120}
                placeholder="For mixed breeds"
              />
            </label>
          </div>
          <div className="section-heading form-section">
            <div>
              <span className="eyebrow">02 / THEIR PEOPLE</span>
              <h2>Owner & recovery details</h2>
            </div>
          </div>
          {isDoctor && (
            <label className="field">
              Registered owner
              <select
                value={ownerId}
                onChange={(event) => {
                  setOwnerId(event.target.value);
                  const selected =
                    owners.data?.find(
                      (owner) => owner._id === event.target.value,
                    ) || user;
                  setContact(selected?.contact || "");
                  setAddress(selected?.address || "");
                }}
              >
                <option value="">My account</option>
                {owners.data?.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name} — {owner.email}
                  </option>
                ))}
              </select>
              {owners.error && (
                <ErrorNotice message={owners.error} retry={owners.retry} />
              )}
            </label>
          )}
          <div className="field-grid">
            <label className="field">
              Contact number
              <input
                name="contact"
                type="tel"
                required
                pattern="(0|\+63)9[0-9]{9}"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="09XXXXXXXXX"
              />
              <small>Use 09XXXXXXXXX or +639XXXXXXXXX.</small>
            </label>
            <label className="field">
              Email <span className="optional">Optional</span>
              <input
                name="email"
                type="email"
                maxLength={254}
                placeholder="owner@example.com"
              />
            </label>
          </div>
          <label className="field">
            Recovery address
            <textarea
              name="address"
              required
              maxLength={500}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
            />
          </label>
          {error && <ErrorNotice message={error} />}
          <div className="form-actions">
            <Link className="btn btn-secondary" to="/dashboard/pets">
              Cancel
            </Link>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Registering…" : "Register pet"}
              <Check size={17} />
            </button>
          </div>
        </div>
        <aside className="form-aside">
          <div className="pet-avatar">
            <PawPrint size={28} />
          </div>
          <h2>
            A small tag.
            <br />A lifelong connection.
          </h2>
          <p>
            Double-check the RFID number and recovery contact before saving.
          </p>
          <div className="aside-rule" />
          <p>
            Vaccinations are recorded by veterinary staff in the pet’s profile,
            with the date each dose was given.
          </p>
          <small>Fields marked optional can be left blank.</small>
        </aside>
      </form>
    </Page>
  );
}
