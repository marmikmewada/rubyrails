const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware usage
router.use(authenticate);

// Route: GET /api/products
// Description: Get all products
router.get('/', async (req, res) => {
    try {
        // Get all products from the database
        const products = await Product.find();
        // Send the products as JSON response
        res.json(products);
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: GET /api/products/:id
// Description: Get a product by ID
router.get('/:id', async (req, res) => {
    try {
        // Find the product by ID in the database
        const product = await Product.findById(req.params.id);
        // If product is not found, return 404 error
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Send the product as JSON response
        res.json(product);
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: POST /api/products
// Description: Create a new product
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        // Upload images to Cloudinary and get their URLs
        const imageUrls = await Promise.all(
            req.files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path);
                return result.secure_url;
            })
        );

        // Create a new product with Cloudinary image URLs
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            imageUrls: imageUrls
        });

        // Save the new product to the database
        await newProduct.save();

        // Send success response with the created product
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Route: PUT /api/products/:id
// Description: Update a product by ID
router.put('/:id', authorize, upload.array('images', 5), async (req, res) => {
    try {
        // Find the product by ID in the database
        const product = await Product.findById(req.params.id);
        // If product is not found, return 404 error
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Upload new images to Cloudinary
        const imagePromises = req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path);
            return result.secure_url;
        });

        const imageUrls = await Promise.all(imagePromises);

        // Update product details with new image URLs
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.imageUrls = imageUrls;

        // Save the updated product to the database
        await product.save();
        // Send success response with the updated product
        res.json(product);
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: DELETE /api/products/:id
// Description: Delete a product by ID
router.delete('/:id', authorize, async (req, res) => {
    try {
        // Implement delete product logic
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
