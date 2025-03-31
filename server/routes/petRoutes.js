import express from 'express';
import Pet from '../models/pets.js';  // Assuming Pet is in the models directory
import users from '../models/users.js';  // Correct import for 'users'

const router = express.Router();

// Route to get pet data based on RFID
router.get('/rfid/:rfid', async (req, res) => {
    try {
        // Fetch pet by RFID and populate the ownerId with user data
        const pet = await Pet.findOne({ rfidNumber: req.params.rfid }).populate('ownerId');
        
        // Handle case where pet is not found
        if (!pet) {
            return res.status(404).send("Pet not found");
        }

        // Sort vaccinationHistory by date in descending order (latest first)
        const sortedVaccinationHistory = pet.vaccinationHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Prepare response with pet and user data
        const responseData = {
            rfid: pet.rfidNumber,
            ownerName: pet.ownerId.name,  // Retrieved from the `User` model via populate
            contact: pet.contact,         // Contact number from the `User` model
            address: pet.address,         // Address from the `User` model
            vaccinationHistory: sortedVaccinationHistory, // Sorted vaccination history
            petName: pet.name,            // Pet's name from the `Pet` model
            petType: pet.petType,         // Pet type (dog/cat)
            breed1: pet.breed1,           // Breed 1
            breed2: pet.breed2,           // Breed 2
        };

        // Send the pet data as response
        res.json(responseData);
    } catch (error) {
        console.error("Error fetching pet:", error.message);
        res.status(500).send("Server error");
    }
});

export default router;
