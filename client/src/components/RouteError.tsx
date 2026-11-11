import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { PawPrint } from "lucide-react";
export default function RouteError() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="route-error">
      <PawPrint size={45} />
      <h1>{missing ? "This page wandered off." : "Something went wrong."}</h1>
      <p>
        {missing
          ? "The page you’re looking for could not be found."
          : "Please reload the page or return to your workspace."}
      </p>
      <div className="actions">
        <Link className="btn btn-primary" to="/dashboard">
          Go to workspace
        </Link>
        <button
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </main>
  );
}
