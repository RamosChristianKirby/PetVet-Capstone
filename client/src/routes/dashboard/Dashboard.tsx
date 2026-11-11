import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  PawPrint,
  ScanLine,
  ShieldCheck,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useResource } from "../../hooks/use-resource";
import { useAuth } from "../../hooks/use-auth";
import {
  Badge,
  Empty,
  ErrorNotice,
  Loading,
  Page,
} from "../../components/shared/Page";
import { formatDate } from "../../lib/dates";
import type { Pet, Visit } from "../../lib/types";
import dog from "../../assets/img/dog1.jpg";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName =
    user?.name.replace(/^Dr\.?\s+/i, "").split(" ")[0] || "there";
  const pets = useResource<Pet[]>("/pets");
  const visits = useResource<Visit[]>("/visits");
  const upcoming = (visits.data || [])
    .filter(
      (visit) =>
        visit.status === "scheduled" && new Date(visit.date) >= new Date(),
    )
    .slice(0, 4);
  return (
    <Page
      title={"Hello, " + firstName + "."}
      description="A little overview of the lives in your care."
      actions={
        <Link className="btn btn-primary" to="/dashboard/pets/create-pet">
          <Plus size={18} />
          Register a pet
        </Link>
      }
    >
      <section className="welcome-card">
        <div>
          <span className="eyebrow">EVERY PAW HAS A STORY</span>
          <h2>
            Good care starts
            <br />
            with connection.
          </h2>
          <p>
            Keep their details close, their care on track,
            <br className="desktop-only" /> and their next chapter a little
            brighter.
          </p>
          <Link to="/dashboard/scan" className="btn btn-dark">
            <ScanLine size={18} />
            Find a pet by RFID
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="welcome-photo">
          <img src={dog} alt="A dog enjoying a quiet moment outdoors" />
          <span>
            <PawPrint size={15} />
            Small tag. Big peace of mind.
          </span>
        </div>
      </section>
      {pets.loading || visits.loading ? (
        <Loading />
      ) : pets.error || visits.error ? (
        <ErrorNotice
          message={pets.error || visits.error}
          retry={() => {
            pets.retry();
            visits.retry();
          }}
        />
      ) : (
        <>
          <section className="stats-grid" aria-label="Registry overview">
            {[
              {
                label: "Registered pets",
                value: pets.data?.length || 0,
                detail:
                  user?.role === "doctor"
                    ? "Across the registry"
                    : "In your family",
                icon: PawPrint,
              },
              {
                label: "Active pets",
                value:
                  pets.data?.filter((pet) => pet.status === "active").length ||
                  0,
                detail: "Ready for their next visit",
                icon: ShieldCheck,
              },
              {
                label: "Upcoming visits",
                value:
                  visits.data?.filter(
                    (visit) =>
                      visit.status === "scheduled" &&
                      new Date(visit.date) >= new Date(),
                  ).length || 0,
                detail: "Scheduled from today",
                icon: CalendarDays,
              },
            ].map(({ label, value, detail, icon: Icon }) => (
              <article className="stat-card" key={label}>
                <div>
                  <span>{label}</span>
                  <Icon size={20} />
                </div>
                <strong>{value.toString().padStart(2, "0")}</strong>
                <small>{detail}</small>
              </article>
            ))}
          </section>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ON THE CALENDAR</span>
                  <h2>Upcoming appointments</h2>
                </div>
                <Link className="text-link" to="/dashboard/visits">
                  View all
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              {upcoming.length ? (
                upcoming.map((visit) => (
                  <Link
                    className="appointment-row"
                    to={"/dashboard/pets/" + visit.petId?._id}
                    key={visit._id}
                  >
                    <span className="date-tile">
                      <small>
                        {new Date(visit.date).toLocaleString("en", {
                          month: "short",
                        })}
                      </small>
                      {new Date(visit.date).getDate()}
                    </span>
                    <div>
                      <strong>{visit.petId?.name || "Pet unavailable"}</strong>
                      <small>{formatDate(visit.date, true)}</small>
                    </div>
                    <Badge value="scheduled" />
                    <ArrowRight size={17} />
                  </Link>
                ))
              ) : (
                <Empty
                  title="A clear calendar"
                  detail="Book a visit from a pet’s profile when you’re ready."
                />
              )}
            </section>
            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR REGISTRY</span>
                  <h2>Recently registered</h2>
                </div>
                <Link className="text-link" to="/dashboard/pets">
                  View all
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              {pets.data?.length ? (
                pets.data.slice(0, 4).map((pet) => (
                  <Link
                    className="pet-mini"
                    to={"/dashboard/pets/" + pet._id}
                    key={pet._id}
                  >
                    <span className={"pet-avatar " + pet.petType}>
                      <PawPrint size={21} />
                    </span>
                    <div>
                      <strong>{pet.name}</strong>
                      <small>
                        {pet.breed1} · {pet.rfidNumber}
                      </small>
                    </div>
                    <ArrowUpRight size={17} />
                  </Link>
                ))
              ) : (
                <Empty
                  title="Make room for a new friend"
                  detail="Register your first pet to get started."
                />
              )}
            </section>
          </div>
        </>
      )}
      <p className="workspace-footer">
        <PawPrint size={13} /> Connected care for Cagayan de Oro’s companions.
      </p>
    </Page>
  );
}
