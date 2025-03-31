import { getUserDetails } from "../../context/UserUtils";
import { useEffect, useState } from "react";
import MarQuee from "react-fast-marquee";
import animalsOne from '../../assets/img/animals1.jpg';
import bunnyOne from '../../assets/img/bunny1.jpg';
import catOne from '../../assets/img/cat1.jpg';
import catTwo from '../../assets/img/cat2.jpg';
import catThree from '../../assets/img/cat3.jpg';
import catFour from '../../assets/img/cat4.jpg';
import dogOne from '../../assets/img/dog1.jpg';
import dogTwo from '../../assets/img/dog2.jpg';
import dogThree from '../../assets/img/dog3.jpg';
import dogFour from '../../assets/img/dog4.jpg';
import dogFive from '../../assets/img/dog5.jpg';
import hedgeOne from '../../assets/img/hedge1.jpg';
import parrotsOne from '../../assets/img/parrots1.jpg';
import guineaPigOne from '../../assets/img/guinePig1.jpg';

// Testikuvia

const rowOneImages = [
  {
    url: animalsOne,
  },
  {
    url: dogOne,
  },
  {
    url: bunnyOne,
  },
  {
    url: dogFour,
  },
  {
    url: catOne,
  },
  {
    url: guineaPigOne,
  },
  {
    url: catThree,
  },
];

const rowTwoImages = [
  {
    url: catTwo,
  },
  {
    url: dogTwo,
  },
  {
    url: parrotsOne,
  },
  {
    url: dogThree,
  },
  {
    url: hedgeOne,
  },
  {
    url: dogFive,
  },
  {
    url: catFour,
  },
];

// Dashboard

const Dashboard = () => {
  const [mounted, setmounted] = useState(false);
  const { name } = getUserDetails();

  useEffect(() => {
    if (!mounted) {
      setmounted(true);
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div>
        <div className="flex items-center justify-center w-full h-screen">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl py-5 xl:text-7xl 2xl:text-8xl text-center xl:leading-[80px] 2xl:leading-[100px] tracking-tighter">
              Welcome to PetVet,<br /> <span className="font-semibold underline">{name}!</span>
            </h1>
            <div className="wrapper bg-gradient-to-br from-sky-100 via-gray-200 to-pink-100 border border-neutral-300 shadow-2xl shadow-gray-300 rounded-md">
              <MarQuee pauseOnHover={true}>
                {rowOneImages.map((i, index) => (
                  <img
                    src={i.url}
                    key={index}
                    alt=""
                    className="md:m-4 w-[150px] m-2 md:w-[300px] rounded-[20px] shadow-md shadow-neutral-800"
                    width={250}
                    height={150}
                  />
                ))}
              </MarQuee>
              <MarQuee direction='right' pauseOnHover={true}>
                {rowTwoImages.map((i, index) => (
                  <img
                    src={i.url}
                    key={index}
                    alt=""
                    className="md:m-4 w-[150px] m-2 md:w-[300px] rounded-[20px] shadow-md shadow-neutral-800"
                    width={250}
                    height={150}
                  />
                ))}
              </MarQuee>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;