
import { Heading } from "./components/Heading";
import { Heroes } from "./components/Heroes";

// Home

const Home = () => {
    return (
        <div className="min-h-full flex flex-col">
            <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
                <Heading />
                <Heroes />
            </div>
        </div>
    );
};

export default Home;

