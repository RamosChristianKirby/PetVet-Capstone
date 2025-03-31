import { useEffect, useState } from "react"
import axios from "axios"
import { formatDate } from "../../../components/shared/FormatDate"
import { capitalize } from "../../../components/shared/Capitalize"
import { Search } from "lucide-react"

// Visit interface
interface Visit {
  _id: string
  petId: { _id: string }
  petName: string
  petOwner: string
  petType: string
  petStatus: string
  date: string
}

const Visits = () => {
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([])
  const [pastVisits, setPastVisits] = useState<Visit[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Authentication token not found.")
          return
        }

        const response = await axios.get("http://localhost:5000/api/visits", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const visitsData: Visit[] = response.data

        // Fetching pets and owners data
        const petsResponses = await axios.get(
          "http://localhost:5000/api/pets",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        const pets = petsResponses.data

        const ownersResponses = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        const owners = ownersResponses.data

        const enrichedVisits = visitsData.map((visit: any) => {
          const pet = pets.find((pet: any) => pet._id === visit.petId._id)
          const owner = owners.find((owner: any) => owner._id === visit.ownerId)
          //   console.log(pet)
          return {
            ...visit,
            petName: pet.name || "Unknown Pet",
            petOwner: owner.name || "Unknown Owner",
            petType: pet.petType || "Unknown Type",
            petStatus: pet.status || "Unknown Status",
          }
        })
        // const petResponses = await Promise.all(
        //   petIds.map((petId) =>
        //     axios.get(`http://localhost:5000/api/pets/${petId}`, {
        //       headers: { Authorization: `Bearer ${token}` },
        //     })
        //   )
        // )

        // const enrichedVisits = visitsData.map((visit) => {
        //   const petResponse = petResponses.find(
        //     (response) => response.data._id === visit.petId._id
        //   )
        //   return {
        //     ...visit,
        //     petName: petResponse?.data.name || "Unknown Pet",
        //     petOwner: petResponse?.data.owner.name || "Unknown Owner",
        //     petType: petResponse?.data.petType || "Unknown Type",
        //     petStatus: petResponse?.data.status || "Unknown Status",
        //   }
        // })

        const now = new Date()
        const upcoming = enrichedVisits
          .filter((visit) => new Date(visit.date) > now)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        const past = enrichedVisits
          .filter((visit) => new Date(visit.date) <= now)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )

        setUpcomingVisits(upcoming)
        setPastVisits(past)
      } catch (error) {
        console.error("Error fetching visits:", error)
      }
    }

    fetchVisits()
  }, [])

  const normalizeDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString()
    const month = (date.getMonth() + 1).toString()
    const withLeadingZeros = `${day.padStart(2, "0")}.${month.padStart(2, "0")}`
    const withoutLeadingZeros = `${parseInt(day)}.${parseInt(month)}`
    return { withLeadingZeros, withoutLeadingZeros }
  }

  // Inline search filter
  const filteredVisits = upcomingVisits.concat(pastVisits).filter((visit) => {
    const searchString =
      `${visit.petName} ${visit.petOwner} ${visit.petType} ${visit.petStatus}`.toLowerCase()
    return searchString.includes(searchQuery.toLowerCase())
  })

  const now = new Date()
  const filteredUpcomingVisits = filteredVisits.filter(
    (visit) => new Date(visit.date) > now
  )
  const filteredPastVisits = filteredVisits.filter(
    (visit) => new Date(visit.date) <= now
  )

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl pb-12 px-4 text-primary w-full">
        <h1 className="text-7xl font-medium leading-tight text-center">
          Visits
        </h1>

        {/* Search Bar */}
        <div className="md:flex flex-col md:mr-4 mt-10">
          <div className="md:w-full justify-between items-center">
            <p className="font-semibold text-lg">Search Visits</p>
            <p className="tracking-tight text-neutral-500 mb-2">
              A list of visits for the selected pets
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

        <div className="grid md:grid-cols-2 gap-4 grid-cols-1 mt-8">
          {/* Upcoming Visits */}
          <div>
            <h2 className="text-lg font-semibold mb-4 px-2">Upcoming Visits</h2>
            <div className="px-6 font-sans border rounded-lg bg-white shadow-lg cursor-default text-sm text-black">
              <table className="w-full border-collapse text-left">
                <thead className="border-slate-300/10">
                  <tr>
                    <th className="py-6 pr-8 text-sm font-semibold">
                      Pet Name
                    </th>
                    <th className="py-6 pr-8 text-sm font-semibold">Owner</th>
                    <th className="py-6 pr-8 text-sm font-semibold">
                      Visit Date
                    </th>
                    <th className="py-6 pr-8 text-sm font-semibold">Type</th>
                    <th className="py-6 pr-8 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-600">
                  {filteredUpcomingVisits.map((visit) => {
                    const { withLeadingZeros, withoutLeadingZeros } =
                      normalizeDate(visit.date)
                    return (
                      <tr
                        key={visit._id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="py-6 pr-8">
                          {capitalize(visit.petName)}
                        </td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petOwner)}
                        </td>
                        <td className="py-6 pr-8">{withLeadingZeros}</td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petType)}
                        </td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petStatus)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Past Visits */}
          <div>
            <h2 className="text-lg font-semibold mb-4 px-2">Past Visits</h2>
            <div className="px-6 font-sans border rounded-lg bg-white shadow-lg cursor-default text-sm text-black">
              <table className="w-full border-collapse text-left">
                <thead className="border-slate-300/10">
                  <tr>
                    <th className="py-6 pr-8 text-sm font-semibold">
                      Pet Name
                    </th>
                    <th className="py-6 pr-8 text-sm font-semibold">Owner</th>
                    <th className="py-6 pr-8 text-sm font-semibold">
                      Visit Date
                    </th>
                    <th className="py-6 pr-8 text-sm font-semibold">Type</th>
                    <th className="py-6 pr-8 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-600">
                  {filteredPastVisits.map((visit) => {
                    const { withLeadingZeros, withoutLeadingZeros } =
                      normalizeDate(visit.date)
                    return (
                      <tr
                        key={visit._id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="py-6 pr-8">
                          {capitalize(visit.petName)}
                        </td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petOwner)}
                        </td>
                        <td className="py-6 pr-8">{withLeadingZeros}</td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petType)}
                        </td>
                        <td className="py-6 pr-8">
                          {capitalize(visit.petStatus)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Visits
