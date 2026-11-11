import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Navigation } from "./dashboard/components/navigation";
import { useAuth } from "../hooks/use-auth";
import { ErrorNotice, Loading } from "../components/shared/Page";
import { ModalProvider } from "../components/providers/modal-provider";
const ProtectedRoute = () => {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <Loading />;
  if (!auth.isAuthenticated)
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  if (auth.error)
    return (
      <div className="page">
        <ErrorNotice message={auth.error} retry={auth.retry} />
        <button className="btn btn-secondary" onClick={auth.logout}>
          Sign out
        </button>
      </div>
    );
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <main id="main" className="workspace-main">
        <Outlet />
      </main>
      <ModalProvider />
    </div>
  );
};
export default ProtectedRoute;
