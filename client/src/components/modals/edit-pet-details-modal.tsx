import { FormEvent, useEffect, useState } from "react";
import { useEditDetails } from "../../hooks/use-pet-details";
import { useAuth } from "../../hooks/use-auth";
import { api, errorMessage, refreshData } from "../../lib/api";
import { formatDate, today } from "../../lib/dates";
import type { Vaccination } from "../../lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ErrorNotice } from "../shared/Page";

export function EditPetDetails() {
  const { isOpen, pet, onClose } = useEditDetails();
  const { user } = useAuth();
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setVaccines(pet?.vaccinationHistory || []);
      setType("");
      setDate("");
      setError("");
    }
  }, [isOpen, pet]);
  function addVaccine() {
    if (!type.trim() || !date || date > today()) {
      setError("Enter a vaccine name and a date on or before today.");
      return;
    }
    setVaccines((previous) => [
      ...previous,
      { date, vaccinationType: type.trim() },
    ]);
    setType("");
    setDate("");
    setError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pet || busy) return;
    if (type || date) {
      setError(
        "Add the pending vaccination to the history, or clear its fields before saving.",
      );
      return;
    }
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api.put("/pets/details/" + pet._id, {
        ...values,
        version: pet.__v,
        ...(user?.role === "doctor" ? { vaccinationHistory: vaccines } : {}),
      });
      refreshData();
      onClose();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {pet?.name}’s details</DialogTitle>
          <DialogDescription>
            Keep identification and recovery information up to date.
          </DialogDescription>
        </DialogHeader>
        {pet && (
          <form
            key={pet._id + String(isOpen)}
            className="modal-form"
            onSubmit={submit}
          >
            <div className="field-grid">
              <label className="field">
                Name
                <input
                  name="name"
                  defaultValue={pet.name}
                  required
                  maxLength={120}
                />
              </label>
              <label className="field">
                Status
                <select name="status" defaultValue={pet.status.toLowerCase()}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="field">
                Species
                <select name="petType" defaultValue={pet.petType}>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </label>
              <label className="field">
                Date of birth
                <input
                  type="date"
                  name="dob"
                  defaultValue={pet.dob.slice(0, 10)}
                  max={today()}
                  required
                />
              </label>
              <label className="field">
                Primary breed
                <input
                  name="breed1"
                  defaultValue={pet.breed1}
                  required
                  maxLength={120}
                />
              </label>
              <label className="field">
                Secondary breed
                <input
                  name="breed2"
                  defaultValue={pet.breed2}
                  maxLength={120}
                />
              </label>
              <label className="field">
                RFID number
                <input
                  name="rfidNumber"
                  defaultValue={pet.rfidNumber}
                  required
                  pattern="[A-Za-z0-9-]{5,64}"
                />
              </label>
              <label className="field">
                Contact number
                <input
                  name="contact"
                  type="tel"
                  defaultValue={pet.contact}
                  required
                />
              </label>
            </div>
            <label className="field">
              Recovery address
              <textarea
                name="address"
                defaultValue={pet.address}
                required
                maxLength={500}
              />
            </label>
            {user?.role === "doctor" && (
              <fieldset className="vaccination-editor">
                <legend>Vaccination history</legend>
                {vaccines.map((vaccine, index) => (
                  <div className="vaccine-row" key={vaccine._id || index}>
                    <div>
                      <strong>{vaccine.vaccinationType}</strong>
                      <small>{formatDate(vaccine.date)}</small>
                    </div>
                    <button
                      type="button"
                      className="text-link danger"
                      onClick={() =>
                        setVaccines((previous) =>
                          previous.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="field-grid">
                  <label className="field">
                    Vaccine name
                    <input
                      value={type}
                      maxLength={120}
                      onChange={(event) => setType(event.target.value)}
                      placeholder="e.g. Rabies"
                    />
                  </label>
                  <label className="field">
                    Date given
                    <input
                      type="date"
                      value={date}
                      max={today()}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addVaccine}
                >
                  Add vaccination to history
                </button>
              </fieldset>
            )}
            {error && <ErrorNotice message={error} />}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
