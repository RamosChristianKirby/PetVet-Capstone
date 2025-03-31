import express from 'express';
import auth from './middleware.js';
import {
    getPets, createPet, updatePet, deletePet,
    getUsers, createUser, updateUser, login,
    getVisits, createVisit, updateVisit, addPetComment, getPetComments, removePetComment, getPetsByOwner,
    updatePetDetails,
    fetchPet
} from '../controllers/controller.js';

const router = express.Router();

// Pet routes

router.get('/pets', auth, getPets);
router.get('/pet/:id', auth, fetchPet);
router.post('/pets', auth, createPet);
router.put('/pets/:id', auth, updatePet);
router.put('/pets/details/:id', auth, updatePetDetails);
router.get('/pets/owner', auth, getPetsByOwner);
router.delete('/pets/:id', auth, deletePet);

// Comments routes

router.get('/pets/:petId/comments', auth, getPetComments);
router.post('/pets/comment', auth, addPetComment);
router.delete('/pets/comments/:commentId/:petId', auth, removePetComment);

// User routes

router.get('/users', getUsers);
router.post('/users/signup', createUser);
router.post('/users/login', login);
router.put('/users/:id', auth, updateUser);

// Visit routes

router.get('/visits', auth, getVisits);
router.post('/visits', auth, createVisit);
router.put('/visits/:id', auth, updateVisit);

export default router;
