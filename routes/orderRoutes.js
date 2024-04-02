const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');

// Middleware usage
// router.use(authenticate);

// Route: POST /api/orders
// Description: Create a new order
router.post('/', async (req, res) => {
    try {
        const { product, totalAmount, paymentMethod } = req.body; // Change 'products' to 'product'

        // Create new order
        const newOrder = new Order({
            product,
            totalAmount,
            user: req.user.userId,
            status: 'processed', // Order status initially set to processed
        });

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Convert to cents
            currency: 'usd',
            payment_method: paymentMethod,
            confirm: true,
        });

        // Check if payment was successful
        if (paymentIntent.status === 'succeeded') {
            newOrder.status = 'paid'; // Update order status to paid
        }

        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: GET /api/orders/myorders
// Description: Get orders of the current user
router.get('/myorders', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// router.use(authorize);
// Route: PUT /api/orders/:id/shipped
// Description: Mark order as shipped by admin
router.put('/:id/shipped', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = 'shipped'; // Update order status to shipped
        await order.save();
        res.json({ message: 'Order marked as shipped', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: PUT /api/orders/:id/delivered
// Description: Mark order as delivered by admin
router.put('/:id/delivered', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = 'delivered'; // Update order status to delivered
        await order.save();
        res.json({ message: 'Order marked as delivered', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: DELETE /api/orders/:id
// Description: Delete an order by admin
router.delete('/:id',   async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await order.remove();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
