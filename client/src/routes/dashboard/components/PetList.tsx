import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Item } from "./item"
import { PawPrint, Dog, Cat } from "lucide-react"
import { useEditDetails } from "../../../hooks/use-pet-details"

interface Vaccination {
  date: Date
  vaccinationType: string
  vaccinationCount: number
}

interface Pet {
  _id: string
  ownerId: string
  name: string
  petType: "dog" | "cat"
  status: "alive" | "deceased"
  dob: Date
  vaccinationHistory: Vaccination[]
}

interface PetListProps {
  level?: number
  showPetsInitially?: boolean
}

// PetList

export const PetList = ({
  level = 0,
  showPetsInitially = false,
}: PetListProps) => {
  const navigate = useNavigate()
  const { pet } = useEditDetails()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [petList, setPetList] = useState<string[]>([])
  const [pets, setPets] = useState<Pet[]>([])

  const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")
  const userRole = userDetails.role
  const userId = userDetails.id

  // Function to handle the expansion of the pet list. TODO Better UI if no pets.

  const onExpand = () => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      allPets: !prevExpanded.allPets,
    }))
  }

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found.")
        return
      }

      // Fetching all pets for doctors or fetching pets based on owner's ID for non-doctors.

      // if (userRole === "doctor") {
      const response = await axios.get("http://localhost:5000/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // } else {
      //   // Fetch pets based on the owner's ID for non-doctors.

      //   response = await axios.get("http://localhost:5000/api/pets/owner", {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   })
      // }

      if (response.status === 200) {
        setPets(
          userDetails.role === "doctor"
            ? response.data
            : response.data.filter((pet: Pet) => pet.ownerId._id === userId)
        )
      } else {
        console.error("Failed to fetch pets:", response)
      }
    } catch (error: any) {
      console.error("Error fetching pets:", error)
      if (error.response) {
        console.error("Error details:", error.response)
      }
    }
  }

  useEffect(() => {
    fetchPets()
  }, [showPetsInitially, userRole, pet]) // Effect runs when showPetsInitially or userRole changes.
  // Function to handle redirection to a pet's details page.

  const onRedirect = (petId: string) => {
    const pet = pets.find((p) => p._id === petId)

    // If found, navigating to the pet's details page with the pet's data.

    if (pet) {
      navigate(`/dashboard/pets/${petId}`, { state: { pet } })
    }
  }

  return (
    <>
      <div>
        <Item
          id="pets"
          onClick={() => navigate("/dashboard/pets")}
          label="Pets"
          icon={PawPrint}
          level={level}
          onExpand={onExpand}
          expanded={expanded.allPets}
          petList={petList}
        />
        {expanded.allPets && (
          <div>
            {pets.map((pet) => (
              <div key={pet._id}>
                <Item
                  id={pet._id}
                  onClick={() => onRedirect(pet._id)}
                  label={pet.name}
                  icon={pet.petType === "dog" ? Dog : Cat}
                  level={level + 1}
                  petList={petList}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
