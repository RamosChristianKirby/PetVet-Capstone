import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Cat, Dog } from "lucide-react";
import type { Pet } from "../../lib/types";
import { Badge, Empty, SearchBox } from "./Page";

export function PetTable({ pets }: { pets: Pet[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const filtered = pets.filter(
    (pet) =>
      (!status || pet.status === status) &&
      [
        pet.name,
        pet.rfidNumber,
        pet.breed1,
        pet.breed2,
        pet.ownerId?.name,
        pet.petType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, totalPages);
  return (
    <section className="panel">
      <div className="table-tools">
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search name, RFID, breed, or owner…"
        />
        <label className="filter-label">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      {!filtered.length ? (
        <Empty
          title={pets.length ? "No matching pets" : "No pets registered yet"}
          detail={
            pets.length
              ? "Try another name, RFID number, or filter."
              : "Add a pet to keep identification and care details together."
          }
        />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pet</th>
                <th>RFID tag</th>
                <th>Owner</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Open record</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 10, current * 10).map((pet) => (
                <tr key={pet._id}>
                  <td>
                    <Link
                      className="pet-cell"
                      to={"/dashboard/pets/" + pet._id}
                    >
                      <span className={"pet-avatar " + pet.petType}>
                        {pet.petType === "dog" ? (
                          <Dog size={23} />
                        ) : (
                          <Cat size={23} />
                        )}
                      </span>
                      <span>
                        <strong>{pet.name}</strong>
                        <small>
                          {pet.breed1}
                          {pet.breed2 ? " / " + pet.breed2 : ""}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="tag-code">{pet.rfidNumber}</span>
                  </td>
                  <td>{pet.ownerId?.name || "Owner unavailable"}</td>
                  <td>
                    <Badge value={pet.status} />
                  </td>
                  <td>
                    <Link
                      className="icon-btn"
                      aria-label={"View " + pet.name}
                      to={"/dashboard/pets/" + pet._id}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <span>
          {filtered.length} pet{filtered.length === 1 ? "" : "s"} · Page{" "}
          {current} of {totalPages}
        </span>
        <div>
          <button
            className="btn btn-secondary"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
