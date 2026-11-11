import { useState } from "react";
import { Link } from "react-router-dom";
import { useResource } from "../../../hooks/use-resource";
import { useAuth } from "../../../hooks/use-auth";
import { api, errorMessage, refreshData } from "../../../lib/api";
import { formatDate } from "../../../lib/dates";
import {
  Badge,
  Empty,
  ErrorNotice,
  Loading,
  Page,
  SearchBox,
} from "../../../components/shared/Page";
import type { Visit } from "../../../lib/types";

export default function Visits() {
  const { data, loading, error, retry } = useResource<Visit[]>("/visits");
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  async function update(id: string, status: "completed" | "cancelled") {
    if (status === "cancelled" && !window.confirm("Cancel this appointment?"))
      return;
    setBusy(id);
    setActionError("");
    try {
      await api.put("/visits/" + id, { status });
      refreshData();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusy("");
    }
  }
  const visits = (data || [])
    .filter((visit) => {
      const upcoming =
        visit.status === "scheduled" && new Date(visit.date) >= new Date();
      return (
        (tab === "all" || (tab === "upcoming" ? upcoming : !upcoming)) &&
        [
          visit.petId?.name,
          visit.ownerId?.name,
          visit.comment,
          formatDate(visit.date, true),
          visit.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) =>
      tab === "upcoming"
        ? Date.parse(a.date) - Date.parse(b.date)
        : Date.parse(b.date) - Date.parse(a.date),
    );
  return (
    <Page
      title="Appointments"
      description="A clear view of the care ahead, and the visits behind."
      actions={
        <Link to="/dashboard/pets" className="btn btn-primary">
          Choose a pet to book
        </Link>
      }
    >
      {actionError && <ErrorNotice message={actionError} />}
      <section className="panel">
        <div className="table-tools">
          <div className="tabs" aria-label="Appointment period">
            {["upcoming", "history", "all"].map((value) => (
              <button
                key={value}
                className={tab === value ? "selected" : ""}
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search appointments…"
          />
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorNotice message={error} retry={retry} />
        ) : !visits.length ? (
          <Empty
            title="No appointments here"
            detail="Open a pet’s profile to book a visit, or try a different filter."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Pet / owner</th>
                  <th>Date & time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit._id}>
                    <td>
                      <Link
                        className="text-link"
                        to={"/dashboard/pets/" + visit.petId?._id}
                      >
                        {visit.petId?.name || "Pet unavailable"}
                      </Link>
                      <small className="cell-subtitle">
                        {visit.ownerId?.name || "Owner unavailable"}
                      </small>
                    </td>
                    <td>{formatDate(visit.date, true)}</td>
                    <td className="note-cell">{visit.comment || "—"}</td>
                    <td>
                      <Badge value={visit.status} />
                    </td>
                    <td>
                      {visit.status === "scheduled" && (
                        <div className="actions">
                          {user?.role === "doctor" && (
                            <button
                              className="btn btn-secondary btn-small"
                              disabled={Boolean(busy)}
                              onClick={() => update(visit._id, "completed")}
                            >
                              Complete
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-small"
                            disabled={Boolean(busy)}
                            onClick={() => update(visit._id, "cancelled")}
                          >
                            {busy === visit._id ? "Saving…" : "Cancel"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Page>
  );
}
