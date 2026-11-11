import { Outlet } from "react-router-dom";
import Navbar from "../../components/nav/Navbar";
import { Footer } from "../home-page/components/Footer";
export default function Root() {
  return (
    <div className="public-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
