import { Navigate, Outlet } from 'react-router-dom';
import { Navigation } from './dashboard/components/navigation';

// ProtectedRoute

const ProtectedRoute = () => {
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  return isAuthenticated ? (
    <div className="h-screen flex text-black">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
    ): (
    <Navigate to="/auth/login" replace />
  );
};

export default ProtectedRoute;
