const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const Product = require('../models/Product');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage(); // Use memory storage for handling file uploads
const upload = multer({ storage: storage });

const path = require('path');

// Specify the absolute path to the service account key file
const keyFilePath = path.resolve(__dirname, '../test-todo-d8179-firebase-adminsdk-ha9tc-afd81f2118.json');

// Configure Firebase Storage with the absolute path to the key file
const storageClient = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  keyFilename: keyFilePath
});
const bucketName = 'test-todo-d8179.appspot.com'; // Your Firebase Storage bucket name
const bucket = storageClient.bucket(bucketName);

// Middleware usage
// router.use(authenticate);

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
// router.use(authorize);
// Route: POST /api/products
// Description: Create a new product
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        // Upload images to Firebase Storage
        const imageUrls = await Promise.all(
            req.files.map(async (file) => {
                const fileName = `${Date.now()}-${file.originalname}`;
                const fileUpload = bucket.file(fileName);

                await fileUpload.save(file.buffer, {
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                return `https://storage.googleapis.com/${process.env.FIREBASE_BUCKET_URL}/${fileName}`;
            })
        );

        // Create a new product with Firebase Storage image URLs
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        });

        // Set imageUrls explicitly
        newProduct.imageUrls = imageUrls;

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



router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete previous images from Firebase Storage (if any)
        const deletedImageUrls = await Promise.all(product.imageUrls.map(deleteImageFromStorage));

        // Upload new images to Firebase Storage
        const imageUrls = await Promise.all(req.files.map(uploadImageToStorage));

        // Update product details with new image URLs
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.imageUrls = imageUrls.filter(url => !!url); // Filter out null values

        // Save the updated product to the database
        await product.save();
        
        // Send success response with the updated product
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

async function deleteImageFromStorage(imageUrl) {
    try {
        // Extract the filename from the image URL
        const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        const file = bucket.file(filename);
        
        // Delete the file from Firebase Storage
        await file.delete();
        return imageUrl; // Return the deleted image URL
    } catch (error) {
        console.error(`Error deleting image ${imageUrl} from storage:`, error);
        return null; // Return null if deletion fails
    }
}

async function uploadImageToStorage(file) {
    try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype
            }
        });

        return `https://storage.googleapis.com/${bucketName}/${fileName}`;
    } catch (error) {
        console.error('Error uploading image to storage:', error);
        return null; // Return null if upload fails
    }
}


// Route: DELETE /api/products/:id
// Description: Delete a product by ID
router.delete('/:id',  async (req, res) => {
    try {
        // Find the product by ID in the database and delete it
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        // If product is not found, return 404 error
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // If product is deleted successfully, send success response
        res.json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        // Handle internal server error
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

