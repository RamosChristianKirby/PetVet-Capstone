import { Outlet } from "react-router-dom";
import { Navbar } from "../../components";
import { Footer } from "../home-page/components/Footer";

// Root

const Root = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary text-black">
      <Navbar />
      <main className="flex-grow pt-40">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Root;
