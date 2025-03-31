import axios from 'axios';
import { useState } from "react";
import { Label } from "../../components/ui/label";
import { useVisit } from "../../hooks/use-visit";
import {
    Dialog,
    DialogContent,
    DialogHeader
} from "../../components/ui/dialog";

// AddVisitModal
export const AddVisitModal = () => {
    const [visitDate, setVisitDate] = useState('');
    const [comment, setComment] = useState('');
    
    // Assuming useVisit returns an object with visit information
    const visit = useVisit();

    // If the visit modal is not open or no pet is selected, return null (do not render)
    if (!visit.isOpen || !visit.pet) {
        console.log("Modal is not open or no pet is selected.");
        return null;
    }

    // Function to handle adding the visit
    const handleAddVisit = async () => {
        if (!visitDate || !visit.pet) {
            console.log("Missing visit date or pet information.");
            return;
        }

        try {
            // Get the auth token from local storage
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token not found.');
                return;
            }

            // API request to add a visit
            const response = await axios.post('http://localhost:5000/api/visits', {
                petId: visit.pet._id,
                date: visitDate,
                comment: comment,
                ownerId: (visit as any).pet.ownerId._id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            // Handle success and close the modal
            if (response.status === 200) {
                visit.onClose();  // Assuming this is closing the modal
                console.log("Visit added successfully.");
            } else {
                throw new Error(response.data.message || 'Failed to add visit');
            }
        } catch (error) {
            console.error('Error adding visit:', error);
        }
    };

    // Enable only for future appointments (today's date)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`; // Ensure input is not before today

    return (
        <Dialog open={visit.isOpen} onOpenChange={visit.onClose}>
            <DialogContent>
                <DialogHeader className="border-b pb-3">
                    <h2 className="text-lg font-medium">
                        Add a Visit
                    </h2>
                </DialogHeader>

                {/* Visit Date Input */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                        <Label>Date</Label>
                        <input
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            min={minDate}
                            className="text-muted-foreground p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Comment Section */}
                <div className="flex flex-col gap-y-1 mt-4">
                    <Label>Add Additional Comments</Label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="text-muted-foreground p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleAddVisit}
                    className="rounded-md px-3.5 py-2.5 text-sm font-semibold bg-neutral-950 text-white hover:shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 mt-6">
                    Add a Visit
                </button>
            </DialogContent>
        </Dialog>
    );
};
