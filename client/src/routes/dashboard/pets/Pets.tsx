import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useResource } from "../../../hooks/use-resource";
import { ErrorNotice, Loading, Page } from "../../../components/shared/Page";
import { PetTable } from "../../../components/shared/PetTable";
import type { Pet } from "../../../lib/types";
export default function Pets() {
  const { data, loading, error, retry } = useResource<Pet[]>("/pets");
  return (
    <Page
      title="Pet registry"
      description="A home for every pet’s details, history, and care."
      actions={
        <Link to="/dashboard/pets/create-pet" className="btn btn-primary">
          <Plus size={18} />
          Register a pet
        </Link>
      }
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice message={error} retry={retry} />
      ) : (
        <PetTable pets={data || []} />
      )}
    </Page>
  );
}
