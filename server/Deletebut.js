const express = require('express');
const mongoose = require('mongoose');
const Pet = require('./models/pets'); // Pet model
const app = express();

// Middleware to parse JSON
app.use(express.json());

// DELETE route to delete a pet by its ID
app.delete('/api/pets/:petId', async (req, res) => {
  const { petId } = req.params;

  try {
    // Use Mongoose deleteOne() to delete the pet from the database
    const result = await Pet.deleteOne({ _id: petId });

    if (result.deletedCount === 0) {
      // If no pet was deleted, return a 404 error
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Successfully deleted the pet
    return res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    // Handle errors that may occur during deletion
    console.error(error);
    return res.status(500).json({ message: 'Error deleting pet' });
  }
});

// Sample MongoDB connection setup (replace with your actual MongoDB URI)
mongoose.connect('mongodb://localhost:27017/petdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected');
    // Start the Express server
    app.listen(5000, () => {
      console.log('Server running on http://localhost:5000');
    });
  })
  .catch(err => console.log(err));

