import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
export default function Navbar() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="public-nav">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <PawPrint size={23} />
        </span>
        <div>
          PetVet<small>CARE, CONNECTED.</small>
        </div>
      </Link>
      <nav aria-label="Account navigation">
        <Link
          className="text-link"
          to={isAuthenticated ? "/dashboard" : "/auth/login"}
        >
          {isAuthenticated ? "My workspace" : "Sign in"}
        </Link>
        <Link
          className="btn btn-primary"
          to={isAuthenticated ? "/dashboard/pets/create-pet" : "/auth/signup"}
        >
          {isAuthenticated ? "Register a pet" : "Get started"}
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
