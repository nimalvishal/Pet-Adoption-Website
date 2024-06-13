const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const validator = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
require("dotenv").config();

const Signup = require('./models/Signup.model');
const Pet = require('./models/Pet.model'); // Assuming you have a Pet model

const secretkey = "122345abcdeht35699uhbhnscsjc98767hijh9#@%$^$%&kcu";

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

const url = process.env.ATLAS_URL;

// Function to generate a JWT token
function generateToken(user) {
  const token = jwt.sign({ userId: user._id, email: user.email }, secretkey, {
    expiresIn: '1h',
  });

  return token;
}

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    res.json({ imageUrl: `http://localhost:8001/uploads/${req.file.originalname}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Signup route
app.post('/signup_form', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Incomplete form data' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Signup({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
app.post('/signup_form/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await Signup.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(existingUser);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Donation route
app.post('/donate-pet', async (req, res) => {
  try {
    console.log('request body: ',req.body);
    const {image, petName, petAge, breed, category, gender, vaccinated, medicalCondition, medicalIssues, petAddress,petphone } = req.body;
    console.log('Pet details:', { image, petName, petAge, breed, category, gender, vaccinated, medicalCondition, medicalIssues, petAddress, petphone });
    const savedPet = await Pet.create({
      image, 
      petName, 
      petAge, 
      breed, 
      category, 
      gender, 
      vaccinated, 
      medicalCondition, 
      medicalIssues, 
      petAddress,
      petphone
    });

    res.status(201).json({ message: 'Pet donated successfully', savedPet });
  } catch (error) {
    console.error('Error donating pet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/getallpetimages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Extract page number from query parameter
    const pageSize = 100; // Number of pets per page

    const pets = await Pet.find({})
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({ pets });
  } catch (error) {
    console.error('Error fetching all pet images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update pet status route
app.put('/updatePetStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.status(200).json({ message: 'Pet status updated successfully', updatedPet });
  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Add this route to your Express server

// Get pet details route
app.get('/getPetDetails/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const petDetails = await Pet.findById(petId);
    
    if (!petDetails) {
      return res.status(404).json({ error: 'Pet details not found' });
    }

    res.status(200).json(petDetails);
  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Search pets route
app.get('/searchPets', async (req, res) => {
  try {
    const { location, category } = req.query;

    console.log('Received search parameters:', { location, category });
    const searchedPets = await Pet.find({
      $or: [
        { petAddress: { $regex: new RegExp(location, 'i') } }, // Case-insensitive search for location
        { category: category.toLowerCase() } // Case-insensitive search for category
      ]
    });

    res.status(200).json({ pets: searchedPets });
  } catch (error) {
    console.error('Error searching pets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

mongoose.connect(url)
  .then(() => {
    console.log('Mongoose database connected successfully');
    app.listen(port, () => {
      console.log(`App running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.get('/', (req, res) => {
  res.json({ "msg": "hello" });
});
