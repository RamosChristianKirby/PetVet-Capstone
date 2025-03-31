import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

import './index.css'
import Auth from './routes/root/Auth.tsx'
import Root from './routes/root/root.tsx'
import Main from './routes/home-page/Main.tsx'
import Visits from './routes/dashboard/visits/Visits.tsx'
import Dashboard from './routes/dashboard/Dashboard.tsx'
import Login from './routes/auth/login/Login.tsx'
import SignUp from './routes/auth/signup/SignUp.tsx'
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import CreatePet from './routes/dashboard/pets/CreatePet.tsx'
import Pets from './routes/dashboard/pets/Pets.tsx'
import PetDetails from './routes/dashboard/pets/PetDetails.tsx'

import { ModalProvider } from './components/providers/modal-provider.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import Owners from './routes/dashboard/owners/Owners.tsx'
import OwnerDetails from './routes/dashboard/owners/OwnerDetails.tsx'

// Router Configuration

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Main />,
      },
    ]
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "pets", element: <Pets /> },
      { path: "pets/:petId", element: <PetDetails /> },
      { path: "pets/create-pet", element: <CreatePet /> },
      { path: "visits", element: <Visits /> },
      { path: "owners", element: <Owners /> },
      { path: "owners/:ownerId", element: <OwnerDetails /> },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ModalProvider />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
