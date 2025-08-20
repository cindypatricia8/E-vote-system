const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('dotenv');
const app = express();

env.config({path: './config/.env'});

const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

const userRoutes = require('./routes/userRoutes');

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log('Server is running on port 3000');
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
