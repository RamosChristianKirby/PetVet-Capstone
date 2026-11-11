import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarPlus,
  Cat,
  Dog,
  Pencil,
  Trash2,
} from "lucide-react";
import { useResource } from "../../../hooks/use-resource";
import { useAuth } from "../../../hooks/use-auth";
import { useVisit } from "../../../hooks/use-visit";
import { useEditDetails } from "../../../hooks/use-pet-details";
import { api, errorMessage, refreshData } from "../../../lib/api";
import { formatDate } from "../../../lib/dates";
import {
  Badge,
  Empty,
  ErrorNotice,
  Loading,
  Page,
} from "../../../components/shared/Page";
import type { Pet, Visit } from "../../../lib/types";

export default function PetDetails() {
  const { petId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const pet = useResource<Pet>("/pet/" + petId);
  const visits = useResource<Visit[]>("/visits?petId=" + petId);
  const visitModal = useVisit();
  const editModal = useEditDetails();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isDoctor = user?.role === "doctor";
  async function addRemark(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/pets/comment", {
        petId,
        content,
        isPublic: visibility === "public",
      });
      setContent("");
      refreshData();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function removeRemark(id: string) {
    if (!window.confirm("Remove this remark?")) return;
    setBusy(true);
    setError("");
    try {
      await api.delete("/pets/comments/" + id + "/" + petId);
      refreshData();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function archive() {
    if (
      !window.confirm(
        "Archive this pet? It will leave the registry and appointment lists. Its history will be retained.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api.delete("/pets/" + petId);
      refreshData();
      navigate("/dashboard/pets", { replace: true });
    } catch (error) {
      setError(errorMessage(error));
      setBusy(false);
    }
  }
  if (pet.loading)
    return (
      <Page title="Pet profile">
        <Loading />
      </Page>
    );
  if (pet.error || !pet.data)
    return (
      <Page
        title="Pet profile"
        actions={
          <Link to="/dashboard/pets" className="btn btn-secondary">
            Back to registry
          </Link>
        }
      >
        <ErrorNotice
          message={pet.error || "Pet not found."}
          retry={pet.retry}
        />
      </Page>
    );
  const record = pet.data;
  const remarks = [
    ...record.publicComments,
    ...(isDoctor ? record.doctorComments : []),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return (
    <Page
      title={record.name}
      description="Their identity, their history, their next steps."
      actions={
        <>
          <Link className="text-link" to="/dashboard/pets">
            <ArrowLeft size={16} />
            Registry
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => editModal.onOpen(record)}
          >
            <Pencil size={16} />
            Edit details
          </button>
          <button
            className="btn btn-primary"
            disabled={record.status !== "active"}
            onClick={() => visitModal.onOpen(record)}
          >
            <CalendarPlus size={17} />
            Book a visit
          </button>
        </>
      }
    >
      {error && <ErrorNotice message={error} />}
      <section className="panel pet-profile">
        <div className="profile-identity">
          <span className={"pet-avatar large " + record.petType}>
            {record.petType === "dog" ? <Dog size={42} /> : <Cat size={42} />}
          </span>
          <div>
            <Badge value={record.status} />
            <h2>{record.name}</h2>
            <p className="muted">
              {record.breed1}
              {record.breed2 ? " / " + record.breed2 : ""}
            </p>
          </div>
        </div>
        <dl className="details-grid">
          <div>
            <dt>RFID number</dt>
            <dd className="tag-code">{record.rfidNumber}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>{formatDate(record.dob)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{record.ownerId?.name || "Owner unavailable"}</dd>
          </div>
          <div>
            <dt>Recovery contact</dt>
            <dd>
              <a href={"tel:" + record.contact}>{record.contact}</a>
            </dd>
          </div>
          <div className="wide">
            <dt>Recovery address</dt>
            <dd>{record.address}</dd>
          </div>
        </dl>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PREVENTIVE CARE</span>
              <h2>Vaccination history</h2>
            </div>
            <span className="count-chip">
              {record.vaccinationHistory.length}
            </span>
          </div>
          {record.vaccinationHistory.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Date given</th>
                  </tr>
                </thead>
                <tbody>
                  {[...record.vaccinationHistory]
                    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
                    .map((vaccine, index) => (
                      <tr key={vaccine._id || index}>
                        <td>{vaccine.vaccinationType}</td>
                        <td>{formatDate(vaccine.date)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No vaccinations recorded"
              detail="Veterinary staff can add confirmed doses through Edit details."
            />
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONTINUING CARE</span>
              <h2>Appointments</h2>
            </div>
            <Link className="text-link" to="/dashboard/visits">
              View all
            </Link>
          </div>
          {visits.loading ? (
            <Loading />
          ) : visits.error ? (
            <ErrorNotice message={visits.error} retry={visits.retry} />
          ) : visits.data?.length ? (
            <div className="visit-list">
              {[...visits.data]
                .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
                .map((visit) => (
                  <article key={visit._id}>
                    <div>
                      <strong>{formatDate(visit.date, true)}</strong>
                      <Badge value={visit.status} />
                    </div>
                    {visit.comment && <p>{visit.comment}</p>}
                  </article>
                ))}
            </div>
          ) : (
            <Empty
              title="A fresh start"
              detail="Book this pet’s first appointment."
            />
          )}
        </section>
      </div>
      <section className="panel remarks-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NOTES FROM THE TEAM</span>
            <h2>Care remarks</h2>
          </div>
        </div>
        {isDoctor && (
          <form className="remark-form" onSubmit={addRemark}>
            <label className="field">
              New remark
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                maxLength={5000}
                rows={3}
                placeholder="Add a care update or medical note…"
              />
            </label>
            <div className="form-actions">
              <label className="field">
                Visibility
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  <option value="public">Shared with owner</option>
                  <option value="private">Veterinary staff only</option>
                </select>
              </label>
              <button
                className="btn btn-primary"
                disabled={busy || !content.trim()}
              >
                {busy ? "Saving…" : "Add remark"}
              </button>
            </div>
          </form>
        )}
        {!remarks.length ? (
          <Empty
            title="No care remarks yet"
            detail="Notes shared by veterinary staff will appear here."
          />
        ) : (
          remarks.map((note) => (
            <article className="remark" key={note._id}>
              <header>
                <strong>{note.author?.name || "Veterinary staff"}</strong>
                <Badge value={note.visibleToOwner ? "shared" : "private"} />
                <time>{formatDate(note.createdAt, true)}</time>
                {isDoctor && (
                  <button
                    className="icon-btn danger"
                    aria-label="Remove remark"
                    disabled={busy}
                    onClick={() => removeRemark(note._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </header>
              <p>{note.content}</p>
            </article>
          ))
        )}
      </section>
      {isDoctor && (
        <div className="archive-row">
          <p>
            Archive duplicate or retired records while retaining their history.
          </p>
          <button
            className="btn btn-secondary danger"
            disabled={busy}
            onClick={archive}
          >
            Archive pet
          </button>
        </div>
      )}
    </Page>
  );
}
