import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

// AuthLayout

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <div className="min-h-screen md:flex text-white bg-neutral-950">
            <div className="relative overflow-hidden md:flex w-1/2 bg-gradient-to-tr from-sky-500 to-purple-500 justify-around items-center hidden">
                <div className='px-5'>
                    <h1 className="text-white font-bold text-4xl font-sans underline">PetVet</h1>
                    <p className="text-white/90 mt-1">Join the Family, Where Every Pet Matters. <br /> Begin Your Journey to Better Pet Health.</p>
                    <Link to="/">
                        <button type="submit" className="block w-28 bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white mt-4 py-2 rounded-2xl font-bold mb-2">Read More</button>
                    </Link>
                </div>
            </div>
            <div className="flex md:w-1/2 justify-center py-10 items-center bg-neutral-950">
                <div className="w-full max-w-sm px-5">
                    <h1 className="text-white font-bold text-4xl mb-1 text-center">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
