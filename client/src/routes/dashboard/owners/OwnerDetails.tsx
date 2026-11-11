import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/use-auth";
import { useResource } from "../../../hooks/use-resource";
import { ErrorNotice, Loading, Page } from "../../../components/shared/Page";
import { PetTable } from "../../../components/shared/PetTable";
import type { Pet, User } from "../../../lib/types";
export default function OwnerDetails() {
  const { ownerId } = useParams();
  const { user } = useAuth();
  const allowed = user?.role === "doctor" && ownerId;
  const owner = useResource<User>(allowed ? "/users/" + ownerId : null);
  const pets = useResource<Pet[]>(
    allowed ? "/pets/owner?ownerId=" + ownerId : null,
  );
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return (
    <Page
      title={owner.data?.name || "Owner profile"}
      description={owner.data?.email}
      actions={
        <Link className="btn btn-secondary" to="/dashboard/owners">
          Back to owners
        </Link>
      }
    >
      {owner.loading || pets.loading ? (
        <Loading />
      ) : owner.error || pets.error ? (
        <ErrorNotice
          message={owner.error || pets.error}
          retry={() => {
            owner.retry();
            pets.retry();
          }}
        />
      ) : (
        <>
          <section className="panel profile-summary">
            <div>
              <span className="eyebrow">CONTACT</span>
              <p>{owner.data?.contact}</p>
            </div>
            <div>
              <span className="eyebrow">ADDRESS</span>
              <p>{owner.data?.address}</p>
            </div>
          </section>
          <PetTable pets={pets.data || []} />
        </>
      )}
    </Page>
  );
}
