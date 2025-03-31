import { Link, useNavigate, } from "react-router-dom"
import { Logo } from "../logo"
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// Navbar

const Navbar = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const isAuthenticated = authContext?.isAuthenticated;

    // handleLogout

    const handleLogout = () => {

        // Clear user authentication data.
    
        localStorage.removeItem('token');
    
        // Update authentication context.
    
        if (authContext) {
          authContext.setIsAuthenticated(false);
        }
    
        // Redirect with slight delay.
    
        setTimeout(() => navigate('/'), 100);
      };

    return (
        <div className="border-b border-neutral-200">
            <div className="wrapperNav z-50 bg-secondary sticky top-0 flex items-center w-full p-6">
                <Logo />
                <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard">
                                <button className="rounded-md text-sm font-semibold p-1 px-2 text-neutral-900 transition-all hover:bg-neutral-200">
                                    Enter to PetVet
                                </button>
                            </Link>
                                <button onClick={handleLogout} className="rounded-md text-sm font-semibold p-1 px-2 transition-all text-white bg-black hover:bg-neutral-700">
                                    Sign Out
                                </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login">
                                <button className="rounded-md text-sm font-semibold p-1 px-2 text-neutral-900 transition-all hover:bg-neutral-200">
                                    Login
                                </button>
                            </Link>
                            <Link to="/auth/signup">
                                <button className="rounded-md text-sm font-semibold p-1 px-2 transition-all text-white bg-black hover:bg-neutral-700">
                                    Sign Up
                                </button>
                            </Link></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar