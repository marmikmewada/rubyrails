const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

// Middleware usage
router.use(authenticate);

// router.post("/", async (req, res) => {
//     console.log(req.body);
//     try {
//       const { productId, paymentMethod, returnUrl } = req.body;
  
//       // Find the product by productId to get its price
//       const product = await Product.findById(productId);
  
//       // Check if product exists
//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }
  
//       // Set total amount to the product's price
//       const totalAmount = product.price;
  
//       // Create new order
//       const newOrder = new Order({
//         product: productId,
//         totalAmount,
//         user: req.user.userId,
//         status: "processed",
//       });
  
//       // Create payment intent with Stripe
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: totalAmount * 100,
//         currency: "usd",
//         payment_method: paymentMethod,
//         confirm: true,
//         return_url: returnUrl,
//       });
  
//       // Check if payment was successful
//       if (paymentIntent.status === "succeeded") {
//         // Save the new order
//         await newOrder.save();
//         // Redirect user to the return URL
//         return res.redirect(returnUrl);
//       } else {
//         // Payment failed
//         return res.status(500).json({ message: "Payment failed" });
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   });
  

router.post("/", async (req, res) => {
    console.log(req.body); // Log the request body for inspection
  
    try {
      const { productId, paymentMethod, returnUrl } = req.body;
  
      // Your logic to find the product based on `productId`
      const product = await findProductById(productId); // Replace with your product retrieval logic
  
      // Replace with your logic to create a PaymentIntent using Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.price * 100, // Assuming price is in a unit that needs conversion to cents
        currency: "usd",
        payment_method_types: ["card"],
      });
  
      if (paymentIntent.status === "succeeded") {
        // Save the new order (including paymentIntent details)
        await saveOrder(req.body, paymentIntent); // Replace with your order saving logic
  
        // Redirect user to the return URL
        return res.redirect(returnUrl);
      } else {
        // Payment failed (handle based on paymentIntent.status)
        return res.status(500).json({ message: "Payment failed" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  




// Route: GET /api/orders/myorders
// Description: Get orders of the current user
router.get("/myorders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ends

// Route: GET /api/orders/myorders
// Description: Get orders of the current user
router.get("/myorders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.use(authorize);
// Route: PUT /api/orders/:id/shipped
// Description: Mark order as shipped by admin
router.put("/:id/shipped", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = "shipped"; // Update order status to shipped
    await order.save();
    res.json({ message: "Order marked as shipped", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route: PUT /api/orders/:id/delivered
// Description: Mark order as delivered by admin
router.put("/:id/delivered", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = "delivered"; // Update order status to delivered
    await order.save();
    res.json({ message: "Order marked as delivered", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route: DELETE /api/orders/:id
// Description: Delete an order by admin
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.remove();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
