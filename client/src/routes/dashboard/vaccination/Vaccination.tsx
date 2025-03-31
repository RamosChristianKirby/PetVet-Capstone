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
