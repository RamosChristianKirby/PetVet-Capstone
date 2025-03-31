import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Pets from '../models/pets.js';
import User from '../models/users.js';
import Visit from '../models/visits.js';

const SECRET_KEY = 's3cr3t';

// Fetch all pets.

export const getPets = async (req, res) => {
    try {

        const userId = req.userId;
        const user = await User.findById(userId);
        const pets = await Pets.find().populate('ownerId');

        // Filter comments based on user role and pet ownership.

        const modifiedPets = pets.map(pet => {
            let filteredDoctorComments = [];
            let filteredPublicComments = [];

            if (user && user.role === 'doctor') {
                filteredDoctorComments = pet.doctorComments;
            }

            if (pet.ownerId.toString() === userId) {
                filteredPublicComments = pet.publicComments;
            }


            return {
                ...pet.toObject(),
                doctorComments: filteredDoctorComments,
                publicComments: filteredPublicComments
            };
        });

        res.status(200).json(modifiedPets);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const fetchPet = async (req, res) => {
    const { petId } = req.params;
    try {
        const pet = await Pets.findById(petId._id)
        console.log(pet)
        res.status(200).json(pet);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deletePet = async (req, res) => {
    const petId = req.params.id;

    try {
        const result = await Pets.findByIdAndDelete(petId);
        if (!result) {
            return res.status(404).send({ message: 'Pet not found' });
        }
        res.status(200).send({ message: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting pet', error });
    }
};

// Fetch Pets for Owners

export const getPetsByOwner = async (req, res) => {
    try {
        const ownerId = req.query.ownerId || req.userId; // Allow ownerId from query or fallback to authenticated userId.

        if (!ownerId) {
            return res.status(400).json({ message: "Owner ID is required." });
        }

        // const pets = await Pets.find({ ownerId }).populate('doctorComments publicComments');
        const pets = await Pets.find({ ownerId });

        if (!pets.length) {
            return res.status(404).json({ message: "No pets found for the given owner ID." });
        }

        // Check user role only if filtering comments based on roles.
        // const user = await User.findById(req.userId);

        // const modifiedPets = pets.map((pet) => {
        //     let filteredDoctorComments = [];
        //     let filteredPublicComments = [];

        //     // if (user && user.role === 'doctor') {
        //     //     filteredDoctorComments = pet.doctorComments; // Doctors see all doctor comments.
        //     // }

        //     // if (pet.ownerId.toString() === req.userId) {
        //     //     filteredPublicComments = pet.publicComments; // Owners see public comments for their pets.
        //     // }

        //     // return {
        //     //     ...pet.toObject(),
        //     //     doctorComments: filteredDoctorComments,
        //     //     publicComments: filteredPublicComments,
        //     // };
        //     return {
        //         ...pet.toObject(),
        //     };
        // });

        res.status(200).json(pets);
    } catch (error) {
        console.error("Error fetching pets by owner:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// Create a new pet.

export const createPet = async (req, res) => {
    const pet = new Pets(req.body);
    try {
        await pet.save();
        res.status(201).json(pet);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

// Update a pet.

export const updatePet = async (req, res) => {
    const { id } = req.params;
    const { comment, isPublic } = req.body;

    try {
        const pet = await Pets.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Creating a new comment object with the content, author, and visibility status.

        const newComment = {
            content: comment,
            author: req.userId,
            visibleToOwner: isPublic
        };

        // Adding the comment to the appropriate array based on its visibility.

        if (isPublic) {
            pet.publicComments.push(newComment);
        } else {
            pet.doctorComments.push(newComment);
        }

        await pet.save();
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Add 
export const updatePetDetails = async (req, res) => {
    const { id } = req.params;
    const { vaccinationHistory, status } = req.body;

    try {
        const pet = await Pets.findByIdAndUpdate(id, { vaccinationHistory, status }, { new: true })
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }
        res.status(200).json(pet)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Fetch all users.

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Sign up a new user.

export const createUser = async (req, res) => {
    const { name, email, address, contact, password } = req.body;

    try {

        // Checking if a user with the given email already exists in the database.

        const existingUser = await User.findOne({ email });
        if (existingUser) {

            // If a user with the same email exists, return a 400 bad request response. TODO: Toast in frontend etc.

            return res.status(400).json({ message: "User already exists" });
        }

        // Hashing the password for secure storage. The '12' is the salt rounds for bcrypt.

        const hashedPassword = await bcrypt.hash(password, 12);

        // Creating a new user with the provided details and the hashed password.

        const result = await User.create({ name, email, address, contact, password: hashedPassword });

        // Generating a JWT token for the new user. This token is used for session management. TODO: Sessions in front ?

        const token = jwt.sign({ email: result.email, id: result._id, role: result.role }, SECRET_KEY, { expiresIn: "1h" });
        res.status(201).json({ result: { name: result.name, email: result.email }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User login.

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        // Attempting to find a user in the database with the provided email.

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Checking if the provided password matches the stored hashed password.

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generating a JWT token that expires in 4 hours.

        const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "4h" });

        const userId = user._id;
        const userRole = user.role;

        res.status(200).json({ result: { name: user.name, email: user.email, id: userId, role: userRole }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a user. TODO: Whole manager in frontend. Currently not in use.

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fetch all visits.

export const getVisits = async (req, res) => {
    try {
        const visits = await Visit.find().populate('petId', 'name');
        res.status(200).json(visits);
    } catch (error) {
        console.error("Error fetching visits:", error);
        res.status(404).json({ message: error.message });
    }
};

// Create a new visit.

export const createVisit = async (req, res) => {
    try {
        const visit = new Visit(req.body);
        await visit.save();
        res.status(200).json(visit);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

// Update a visit.

export const updateVisit = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    // Updating the visit record in the database.
    // The 'findByIdAndUpdate' method searches for a visit by its ID and updates it with the provided data.
    // The option { new: true } ensures that the method returns the updated document.

    try {
        const updatedVisit = await Visit.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json(updatedVisit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a comment to a pet.

export const addPetComment = async (req, res) => {
    const { petId, content, isPublic } = req.body;

    try {
        const pet = await Pets.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        const newComment = {
            petId,
            content,
            author: req.userId,
            visibleToOwner: isPublic
        };

        // Add the comment to the appropriate array based on its visibility.

        if (isPublic) {
            pet.publicComments.push(newComment);
        } else {
            pet.doctorComments.push(newComment);
        }

        await pet.save();
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get comments for a specific pet.

export const getPetComments = async (req, res) => {
    const { petId } = req.params;

    try {

        // Fetching the pet by its ID from the database.
        // Populating the author details for both public and doctor comments.

        const pet = await Pets.findById(petId)
            .populate('publicComments.author', 'name role')
            .populate('doctorComments.author', 'name role');

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        res.status(200).json({
            publicComments: pet.publicComments,
            doctorComments: pet.doctorComments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a comment from a pet.

export const removePetComment = async (req, res) => {
    const { commentId, petId } = req.params;

    try {
        const pet = await Pets.findById(petId);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }


        if (req.userRole !== 'doctor') {
            return res.status(403).json({ message: "Only doctors can remove comments" });
        }

        // Determining which comment array (doctor or public) the comment belongs to.

        let commentArray = null;
        if (pet.doctorComments && pet.doctorComments.some(comment => comment._id.toString() === commentId)) {
            commentArray = pet.doctorComments;
        } else if (pet.publicComments && pet.publicComments.some(comment => comment._id.toString() === commentId)) {
            commentArray = pet.publicComments;
        }

        if (!commentArray) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Finding the index of the comment in the array.

        const commentIndex = commentArray.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Remove the comment from the array.

        const removedComment = commentArray.splice(commentIndex, 1);

        await pet.save();

        res.status(200).json({ message: "Comment removed successfully", removedComment });
    } catch (error) {
        console.error("Error during MongoDB operation:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
