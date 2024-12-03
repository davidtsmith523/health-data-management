const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;

// Importing routes
const userRoutes = require('./routes.js');

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for cross-origin requests from React frontend

// API routes
app.use('/api/users', userRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

