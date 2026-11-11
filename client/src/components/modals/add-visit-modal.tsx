import { FormEvent, useEffect, useState } from "react";
import { useVisit } from "../../hooks/use-visit";
import { api, errorMessage, refreshData } from "../../lib/api";
import { localDateTime } from "../../lib/dates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ErrorNotice } from "../shared/Page";
export function AddVisitModal() {
  const { isOpen, pet, onClose } = useVisit();
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setDate("");
      setComment("");
      setError("");
    }
  }, [isOpen, pet?._id]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pet || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/visits", {
        petId: pet._id,
        date: new Date(date).toISOString(),
        comment,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a visit for {pet?.name}</DialogTitle>
          <DialogDescription>
            Choose a date and time in your local timezone.
          </DialogDescription>
        </DialogHeader>
        <form className="modal-form" onSubmit={submit}>
          <label className="field">
            Appointment date & time
            <input
              type="datetime-local"
              required
              value={date}
              min={localDateTime()}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label className="field">
            Reason for the visit
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Anything the veterinary team should know?"
            />
          </label>
          {error && <ErrorNotice message={error} />}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Booking…" : "Book appointment"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
