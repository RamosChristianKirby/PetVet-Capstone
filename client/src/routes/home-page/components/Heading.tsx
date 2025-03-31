import { Link } from "react-router-dom"

// Heading

export const Heading = () => {
    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Pet Vet: Your Pet&apos;s Health, Our Passion. Welcome to <span className="underline">PetVet</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium text-neutral-700">
                "Empowering Pet Owners with Expert Care and Compassionate Solutions for a Happier, Healthier Best Friend"
            </h3>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/dashboard" className="rounded-md bg-neutral-950 px-3.5 py-2.5 text-sm font-semibold text-white dark:text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:neutral-900">
                    Get Started
                </Link>
            </div>
        </div>
    );
};