import { Outlet } from "react-router-dom";

// Auth

const Auth = () => {
  return (
    <div className="h-screen flex text-black">
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Auth;
