const express = require('express');
const connectDB = require('./config/configDb');

// Load environment variables
require('dotenv').config();

// Create an instance of Express
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
const ordersRoutes = require('./routes/orderRoutes.js');
const usersRoutes = require('./routes/userRoutes.js'); // Assuming you have user routes
const productsRoutes = require('./routes/productRoutes.js'); // Assuming you have product routes

app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes); // Mount user routes
app.use('/api/products', productsRoutes); // Mount product routes

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;
const run = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

run();
