import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Separator } from "../../../components/ui/separator"
import { capitalize } from "../../../components/shared/Capitalize"
import { formatDate } from "../../../components/shared/FormatDate"
import { Search } from "lucide-react"

interface Owner {
  name: string
  address: string
  contact: string
  role: "pet_owner" | "doctor"
  email: string
}

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
  rfidNumber: string
  ownerId: Owner
  user: string
  address: string
  breed1: string
  breed2: string
  vaccinationHistory: Vaccination[]
}

const Pets = () => {
  const [pets, setPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null) // Track the user's role
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>("")

  const filteredPets = pets.filter((pet) => {
    const petName = pet.name.toLowerCase()
    const petStatus = pet.status.toLowerCase()
    const petType = pet.petType.toLowerCase()
    const petRfidNumber = pet.rfidNumber.toLowerCase()
    const standardPetDOB = formatDate(pet.dob)
    const zeroOmittedPetDOB = generateSearchableDate(pet.dob)

    const searchLower = searchQuery.toLowerCase()

    const matchesSearchQuery =
      petName.includes(searchLower) ||
      petStatus.includes(searchLower) ||
      petType.includes(searchLower) ||
      petRfidNumber.includes(searchLower) ||
      standardPetDOB.toLowerCase().includes(searchLower) ||
      zeroOmittedPetDOB.includes(searchLower)

    const matchesStatusFilter =
      statusFilter === "" || pet.status === statusFilter

    return matchesSearchQuery && matchesStatusFilter
  })

  // Generate a formatted date for search
  function generateSearchableDate(dateInput: Date): string {
    const date = new Date(dateInput)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    return `${day}.${month}.${year}`
  }

  useEffect(() => {
    // Fetch the user's role and set it
    const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")
    setUserRole(userDetails.role)
    const userId = userDetails.id

    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Authentication token not found.")
          return
        }

        let url = ""

        // if (userDetails.role === "pet_owner") {
        // url = "http://localhost:5000/api/pets/owner"
        // } else if (userDetails.role === "doctor") {
        url = "http://localhost:5000/api/pets"
        // }

        if (url) {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = response.data
          console.log(response.data)

          console.log(data)
          if (Array.isArray(data)) {
            setPets(
              userDetails.role === "doctor"
                ? data
                : data.filter((pet: Pet) => pet.ownerId._id === userId)
            )
          } else {
            console.error("Data is not an array:", data)
          }
        } else {
          console.error("URL not defined for user role.")
        }
      } catch (error) {
        console.error("Error fetching pets:", error)
      }
    }

    fetchPets()
  }, [userRole]) // Re-run the effect if userRole changes

  // Redirect to the pet details page
  const onRedirect = (petId: string) => {
    const pet = pets.find((p) => p._id === petId)
    if (pet) {
      navigate(`/dashboard/pets/${petId}`, { state: { pet } })
    }
  }

  // Delete pet from the database and update UI
  const handleDelete = async (petId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pet?"
    )
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found.")
        return
      }

      const response = await axios.delete(
        `http://localhost:5000/api/pets/${petId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        console.log("Pet deleted, updating UI")
        // Remove pet from the UI state after successful deletion
        setPets((prevPets) => prevPets.filter((pet) => pet._id !== petId))
      } else {
        console.error("Failed to delete pet")
      }
    } catch (error) {
      console.error("Error deleting pet:", error)
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl pb-12 px-4 text-primary w-full">
        <div id="welcome" className="mt-10">
          <h1 className="text-7xl font-medium leading-tight text-center">
            <span className="block">Pets</span>
          </h1>
        </div>

        <Separator />

        <div className="md:flex flex items-end md:mr-4 mt-10">
          <div className="md:w-full justify-between items-center">
            <p className="font-semibold text-lg">Pets</p>
            <p className="tracking-tight text-neutral-500 mb-2">
              A list of pets currently in the database
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 w-32 shadow-lg h-10 font-medium"
          >
            <option value="">All</option>
            <option value="Active" className="text-green-800">
              Active
            </option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="text-black px-6 font-sans lg:py-0 border rounded-lg bg-white shadow-lg mt-8 cursor-default text-sm">
          <div className="p-2">
            <table className="w-full border-collapse text-left">
              <thead className="border-slate-300/10 last:border-none">
                <tr>
                  <th className="py-6 pr-8 text-sm font-semibold">Name</th>
                  <th className="py-6 pr-8 text-sm font-semibold">
                    Date of Birth
                  </th>
                  <th className="hidden py-6 pr-8 text-sm font-semibold lg:table-cell">
                    Status
                  </th>
                  <th className="hidden py-6 pr-8 text-sm font-semibold lg:table-cell">
                    Type
                  </th>
                  {/* Only show owner for doctor */}
                  {userRole === "doctor" && (
                    <th className="hidden py-6 pr-8 text-sm font-semibold lg:table-cell">
                      Owner
                    </th>
                  )}
                  <th className="hidden py-6 pr-8 text-sm font-semibold lg:table-cell">
                    RFID
                  </th>
                  <th className="py-6 pr-8 text-sm font-semibold"></th>
                </tr>
              </thead>
              <tbody className="text-neutral-600 font-semibold">
                {filteredPets.map((pet) => (
                  <tr key={pet._id}>
                    <td
                      onClick={() => onRedirect(pet._id)}
                      className="py-6 pr-8 hover:text-black hover:underline cursor-pointer"
                    >
                      {capitalize(pet.name || "")} {/* Safe fallback */}
                    </td>
                    <td className="py-6 pr-8">{formatDate(pet.dob)}</td>
                    <td className="hidden py-6 pr-8 lg:table-cell">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium leading-5 text-white ${
                          pet.status?.toLowerCase() === "deceased"
                            ? "bg-red-500/90"
                            : "bg-green-500/90"
                        }`}
                      >
                        {capitalize(pet.status || "")} {/* Safe fallback */}
                      </span>
                    </td>
                    <td className="hidden py-6 pr-8 lg:table-cell">
                      {capitalize(pet.petType || "")} {/* Safe fallback */}
                    </td>
                    {/* Only show owner info for users with the 'doctor' role */}
                    {userRole === "doctor" && (
                      <td className="hidden py-6 pr-8 lg:table-cell">
                        {capitalize(pet.ownerId?.name || "")}{" "}
                        {/* Safe fallback */}
                      </td>
                    )}
                    <td className="hidden py-6 pr-8 lg:table-cell">
                      {pet.rfidNumber}
                    </td>
                    <td className="py-6 pr-8">
                      <button
                        onClick={() => handleDelete(pet._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pets
