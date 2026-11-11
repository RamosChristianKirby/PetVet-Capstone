export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  address: string;
  contact: string;
  role: "doctor" | "pet_owner";
}
export interface Vaccination {
  _id?: string;
  date: string;
  vaccinationType: string;
}
export interface Remark {
  _id: string;
  content: string;
  createdAt: string;
  visibleToOwner: boolean;
  author: { _id: string; name: string; role: string } | null;
}
export interface Pet {
  _id: string;
  __v: number;
  name: string;
  petType: "dog" | "cat";
  status: "active" | "inactive";
  dob: string;
  rfidNumber: string;
  breed1: string;
  breed2: string;
  contact: string;
  address: string;
  email?: string;
  ownerId: User | null;
  vaccinationHistory: Vaccination[];
  publicComments: Remark[];
  doctorComments: Remark[];
}
export interface Visit {
  _id: string;
  petId: Pick<Pet, "_id" | "name" | "petType" | "status" | "rfidNumber"> | null;
  ownerId: Pick<User, "_id" | "name"> | null;
  date: string;
  comment: string;
  status: "scheduled" | "completed" | "cancelled";
}
export interface Session {
  token: string;
  result: User;
}
export interface ScanResult {
  _id: string;
  rfid: string;
  petName: string;
  petType: string;
  status: string;
  breed1: string;
  breed2: string;
  ownerName: string;
  contact: string;
  address: string;
  vaccinationHistory: Vaccination[];
}
