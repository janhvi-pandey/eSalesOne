const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('MongoDB connected');
})
.catch(err => {
  console.error(' MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Server is running 😊');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
