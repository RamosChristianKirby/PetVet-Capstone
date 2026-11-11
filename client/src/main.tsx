import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./workspace.css";
import Root from "./routes/root/root";
import Auth from "./routes/root/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import RouteError from "./components/RouteError";
import { Loading } from "./components/shared/Page";
const Main = lazy(() => import("./routes/home-page/Main"));
const Login = lazy(() => import("./routes/auth/login/Login"));
const SignUp = lazy(() => import("./routes/auth/signup/SignUp"));
const Dashboard = lazy(() => import("./routes/dashboard/Dashboard"));
const Pets = lazy(() => import("./routes/dashboard/pets/Pets"));
const CreatePet = lazy(() => import("./routes/dashboard/pets/CreatePet"));
const PetDetails = lazy(() => import("./routes/dashboard/pets/PetDetails"));
const Owners = lazy(() => import("./routes/dashboard/owners/Owners"));
const OwnerDetails = lazy(
  () => import("./routes/dashboard/owners/OwnerDetails"),
);
const Visits = lazy(() => import("./routes/dashboard/visits/Visits"));
const Scan = lazy(() => import("./routes/dashboard/scan/Scan"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Main /> }],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "pets", element: <Pets /> },
      { path: "pets/create-pet", element: <CreatePet /> },
      { path: "pets/:petId", element: <PetDetails /> },
      { path: "owners", element: <Owners /> },
      { path: "owners/:ownerId", element: <OwnerDetails /> },
      { path: "visits", element: <Visits /> },
      { path: "scan", element: <Scan /> },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <RouteError />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </React.StrictMode>,
);
