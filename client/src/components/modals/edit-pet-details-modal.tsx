import axios from "axios"
import React, { useEffect, useState } from "react"
import { useEditDetails } from "../../hooks/use-pet-details"
import { Label } from "../../components/ui/label"
import { Dialog, DialogContent, DialogHeader } from "../../components/ui/dialog"

// EditPetDetails

export const EditPetDetails = () => {
  const editDetails = useEditDetails()

  const [name, setName] = useState("")
  const [status, setStatus] = useState("")
  const [vaccinationHistory, setVaccinationHistory] = useState<any>([])
  const [vaccinationType, setVaccinationType] = useState("")
  const [vaccinationDate, setVaccinationDate] = useState<any>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editDetails?.pet?.name) setName(editDetails?.pet?.name)
    if (editDetails?.pet?.vaccinationHistory) {
      setVaccinationHistory(editDetails?.pet?.vaccinationHistory as [])
    }
    if (editDetails?.pet?.vaccinationHistory) {
      setStatus(editDetails?.pet?.status)
    }
  }, [editDetails])

  if (!editDetails.isOpen || !editDetails.pet) {
    return null
  }

  const handleConfirm = async () => {
    if (!editDetails.pet) {
      console.error("Pet details not found")
      return
    }
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.put(
        `http://localhost:5000/api/pets/details/${editDetails.pet._id}`,
        {
          status,
          vaccinationHistory,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response) {
        editDetails.onClose()
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating pet:", error)
    } finally {
      setLoading(false)
    }
  }

  const addVaccination = () => {
    if (!vaccinationType || !vaccinationDate) return
    setVaccinationHistory((prev: any) => [
      ...prev,
      {
        vaccinationType,
        date: new Date(vaccinationDate).toISOString(),
      },
    ])
    setVaccinationType("")
    setVaccinationDate("")
  }

  const removeVaccination = (index: number) => {
    setVaccinationHistory((prev: any) =>
      prev.filter((_: any, i: number) => i !== index)
    )
  }

  return (
    <Dialog open={editDetails.isOpen} onOpenChange={editDetails.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">Edit Pet Details</h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2 w-full">
            <Label>Pet Details</Label>
            <span className="mt-4 block">
              <div className="flex items-center gap-x-4 mb-2">
                <h2 className="font-semibold">Name</h2>
                <span className="block">{name}</span>
              </div>
            </span>
            <div className="flex flex-col gap-y-2 w-full">
              <Label>Status</Label>
              <select
                className="border rounded px-1 py-0.5"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <span className="block">
              <div className="flex items-center gap-x-4 mb-2">
                <h2 className="font-semibold">Vaccination History</h2>
              </div>
            </span>
            <div>
              <button
                className="w-full hover:bg-primary/80 bg-primary text-white text-sm font-medium p-2 rounded"
                onClick={addVaccination}
              >
                Add Vaccination
              </button>
            </div>
            <div className="overflow-y-auto flex flex-col h-96 w-full space-y-2 px-0.5">
              <div className="border rounded-lg p-2 shadow flex justify-between w-full">
                <div className="flex flex-col gap-2 w-full">
                  <Label>Type</Label>
                  <input
                    className="border rounded px-1 py-0.5"
                    value={vaccinationType}
                    onChange={(e) => setVaccinationType(e.currentTarget.value)}
                    placeholder="Vaccination Type"
                  />
                  <Label>Date Vaccinated</Label>
                  <input
                    type="date"
                    value={vaccinationDate ? vaccinationDate.split("T")[0] : ""}
                    onChange={(e) => {
                      setVaccinationDate(e.target.value)
                    }}
                    className="border rounded px-1 py-0.5"
                  />
                </div>
              </div>
              {vaccinationHistory.reverse().map((vaccine, index) => (
                <div
                  className="border rounded-lg p-2 shadow flex justify-between"
                  key={index}
                >
                  <div>
                    <Label>Type</Label>
                    <p>{vaccine.vaccinationType}</p>
                    <Label>Date Vaccinated</Label>
                    <p>
                      {new Date(vaccine.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="h-full  flex items-center justify-center">
                    <button
                      className="text-red-700 font-medium p-2 h-fit hover:bg-red-50 rounded"
                      onClick={() => removeVaccination(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          className="rounded-md px-3.5 py-2.5 text-sm font-semibold bg-neutral-950 text-white hover:shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        >
          Confirm
        </button>
      </DialogContent>
    </Dialog>
  )
}
