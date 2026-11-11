import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import { useAuth } from "../../../hooks/use-auth";
import { useResource } from "../../../hooks/use-resource";
import {
  Empty,
  ErrorNotice,
  Loading,
  Page,
  SearchBox,
} from "../../../components/shared/Page";
import type { User } from "../../../lib/types";
export default function Owners() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useResource<User[]>(
    user?.role === "doctor" ? "/users" : null,
  );
  const [query, setQuery] = useState("");
  if (user?.role !== "doctor") return <Navigate to="/dashboard" replace />;
  const owners = (data || []).filter((owner) =>
    [owner.name, owner.email, owner.contact]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Page
      title="Pet owners"
      description="The people behind every happy, healthy companion."
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice message={error} retry={retry} />
      ) : (
        <section className="panel">
          <div className="table-tools">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search name, email, or phone…"
            />
            <span className="muted">{owners.length} owners</span>
          </div>
          {owners.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Pets</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner._id}>
                      <td>
                        <Link
                          className="pet-cell"
                          to={"/dashboard/owners/" + owner._id}
                        >
                          <span className="pet-avatar">
                            <Users size={20} />
                          </span>
                          <span>
                            <strong>{owner.name}</strong>
                            <small>{owner.email}</small>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <a href={"tel:" + owner.contact}>{owner.contact}</a>
                      </td>
                      <td>{owner.address}</td>
                      <td>
                        <Link
                          className="icon-btn"
                          aria-label={"View pets of " + owner.name}
                          to={"/dashboard/owners/" + owner._id}
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No owners found"
              detail="Registered pet owners will appear here."
            />
          )}
        </section>
      )}
    </Page>
  );
}
