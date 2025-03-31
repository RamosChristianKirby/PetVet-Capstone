import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { capitalize } from "../../../components/shared/Capitalize"
import { formatDate } from "../../../components/shared/FormatDate"
import { Search } from "lucide-react"

interface Vaccination {
  date: Date
  vaccinationType: string
}

interface Pet {
  _id: string
  name: string
  dob: Date
  status: string
  petType: string
  vaccinationHistory: Vaccination[]
}

const OwnerDetails = () => {
  const { ownerId } = useParams<{ ownerId: string }>()
  const [pets, setPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")
  const isDoctor = userDetails.role === "doctor"

  // Filter pets based on the search query.
  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.petType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (!isDoctor) {
      navigate(`/dashboard`)
      return () => {}
    }
    const fetchOwnerPets = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Authentication token not found.")
          return
        }

        const response = await axios.get(
          `http://localhost:5000/api/pets/owner?ownerId=${ownerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setPets(response.data)
      } catch (error) {
        console.error("Error fetching owner pets:", error)
      }
    }

    fetchOwnerPets()
  }, [ownerId])

  const handlePetClick = (pet: Pet) => {
    navigate(`/dashboard/pets/${pet._id}`, { state: { pet } })
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl pb-12 px-4 text-primary w-full">
        <h1 className="text-7xl font-medium leading-tight text-center">
          Owner's Pets
        </h1>

        {/* Search Bar */}
        <div className="md:flex flex-col md:mr-4 mt-10">
          <div className="md:w-full justify-between items-center">
            <p className="font-semibold text-lg">Pets</p>
            <p className="tracking-tight text-neutral-500 mb-2">
              A list of pets for the selected owner
            </p>
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

        <div className="mt-8">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="py-6 pr-8 text-sm font-semibold">Name</th>
                <th className="py-6 pr-8 text-sm font-semibold">DOB</th>
                <th className="py-6 pr-8 text-sm font-semibold">Status</th>
                <th className="py-6 pr-8 text-sm font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredPets.map((pet) => (
                <tr
                  key={pet._id}
                  onClick={() => handlePetClick(pet)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="py-6 pr-8">{capitalize(pet.name)}</td>
                  <td className="py-6 pr-8">{formatDate(pet.dob)}</td>
                  <td className="py-6 pr-8">{capitalize(pet.status)}</td>
                  <td className="py-6 pr-8">{capitalize(pet.petType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OwnerDetails
