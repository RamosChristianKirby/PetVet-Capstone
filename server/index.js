import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import postRoutes from './routes/posts.js';
import petRoutes from './routes/petRoutes.js'; // Import the new RFID route
dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use('/api', postRoutes);
app.use('/api/pets', petRoutes); // Use the pet routes here

app.get('/', (req, res) => {
    res.send('App is running...');
});

const CONNECTION_URL = 'mongodb+srv://kabyitvv:kirbyxd12@capstoneserver.7m9ce.mongodb.net/?retryWrites=true&w=majority&appName=CapstoneServer';
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));
