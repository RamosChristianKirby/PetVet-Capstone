import axios from 'axios';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "../../../components/ui/separator";
import { capitalize } from "../../../components/shared/Capitalize";
import { Search } from "lucide-react";

interface Owner {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
}

const Owners = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  const isDoctor = userDetails.role === 'doctor';
  // Filter owners based on the search query.
  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if(!isDoctor){
      navigate(`/dashboard`);
      return () => {}
    }
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token not found.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = response.data.filter((user: any) => user.role === 'pet_owner');
        setOwners(data);
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };

    fetchOwners();
  }, []);

  // Navigate to the OwnerDetails page.
  const onRedirect = (ownerId: string) => {
    navigate(`/dashboard/owners/${ownerId}`);
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl pb-12 px-4 text-primary w-full">
        <div id="welcome" className="mt-10">
          <h1 className="text-7xl font-medium leading-tight text-center">
            <span className="block">Pet Owners</span>
          </h1>
        </div>

        <Separator />

        <div className="md:flex flex-col md:mr-4 mt-10">
          <div className="md:w-full justify-between items-center">
            <p className="font-semibold text-lg">Owners</p>
            <p className="tracking-tight text-neutral-500 mb-2">A list of pet owners in the database</p>
            <div className="flex items-center w-full rounded-lg p-2 bg-white border shadow-lg md:w-2/3">
              <div className="flex-shrink-0 pl-2 pr-3">
                <Search size={16} className="text-muted-foreground/70" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full focus:outline-none bg-white text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="text-black px-6 font-sans lg:py-0 border rounded-lg bg-white shadow-lg mt-8 cursor-default text-sm">
          <div className="p-2">
            <table className="w-full border-collapse text-left">
              <thead className=" border-slate-300/10 last:border-none">
                <tr>
                  <th className="py-6 pr-8 text-sm font-semibold">Name</th>
                  <th className="py-6 pr-8 text-sm font-semibold">Email</th>
                </tr>
              </thead>
              <tbody className='text-neutral-600 font-semibold'>
                {filteredOwners.map((owner) => (
                  <tr key={owner._id}>
                    <td
                      onClick={() => onRedirect(owner._id)}
                      className='py-6 pr-8 hover:text-black hover:underline cursor-pointer'
                    >
                      {capitalize(owner.name)}
                    </td>
                    <td className='py-6 pr-8'>{owner.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owners;
