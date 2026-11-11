import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  Users,
  ScanLine,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "../../../hooks/use-settings";
import { useAuth } from "../../../hooks/use-auth";
export const Navigation = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/pets", label: "Pet registry", icon: PawPrint },
    { to: "/dashboard/visits", label: "Appointments", icon: CalendarDays },
    ...(user?.role === "doctor"
      ? [{ to: "/dashboard/owners", label: "Pet owners", icon: Users }]
      : []),
    { to: "/dashboard/scan", label: "RFID lookup", icon: ScanLine },
  ];
  return (
    <>
      <header className="mobile-bar">
        <Link to="/dashboard" className="brand">
          <PawPrint />
          PetVet<span>CARE, CONNECTED.</span>
        </Link>
        <button
          className="icon-btn"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside id="sidebar" className={"sidebar " + (open ? "sidebar-open" : "")}>
        <Link to="/dashboard" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <PawPrint size={24} />
          </span>
          <div>
            PetVet<small>CARE, CONNECTED.</small>
          </div>
        </Link>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                "nav-link " + (isActive ? "nav-active" : "")
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link
          className="btn btn-primary sidebar-add"
          to="/dashboard/pets/create-pet"
          onClick={() => setOpen(false)}
        >
          <Plus size={17} />
          Register a pet
        </Link>
        <div className="sidebar-note">
          <span className="status-dot" />
          <p>
            A little care.
            <br />
            <strong>A better life.</strong>
          </p>
          <PawPrint size={42} strokeWidth={1} />
        </div>
        <div className="sidebar-bottom">
          <button
            className="nav-link"
            onClick={() => {
              settings.onOpen();
              setOpen(false);
            }}
          >
            <Settings size={18} />
            My profile
          </button>
          <div className="account">
            <span className="avatar">{user?.name?.slice(0, 1)}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>
                {user?.role === "doctor" ? "Veterinary staff" : "Pet owner"}
              </small>
            </div>
            <button className="icon-btn" onClick={logout} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
