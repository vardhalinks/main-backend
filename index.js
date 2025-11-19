import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,POST",
  })
);

app.use(bodyParser.json());

// Root Route (REQUIRED FOR RENDER)
app.get("/", (req, res) => {
  res.send("Backend running OK!");
});

// Razorpay Setup — use env vars for keys
const razorpay = new Razorpay({
  key_id: process.env.rzp_test_RfEZA7cY0icEUx,
  key_secret: process.env.j8CQrjDHuDKJGa4mHg50oea1,
});

// Create Order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  // Use the configured Razorpay key secret for verification
  const expectedSign = crypto.createHmac("sha256", process.env.j8CQrjDHuDKJGa4mHg50oea1|| "").update(sign).digest("hex");

  if (razorpay_signature === expectedSign) {
    console.log("Payment verified:", { razorpay_order_id, razorpay_payment_id });
    // Redirect to success page
    return res.redirect("https://arunlive.com/success.html");
  } else {
    console.warn("Payment verification failed:", { razorpay_order_id, razorpay_payment_id });
    // Redirect to failed page
    return res.redirect("https://arunlive.com/failed.html");
  }
});

// Generate secure link after payment success — returns a JWT-based link
app.post("/generate-link", (req, res) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    return res.status(400).json({ error: "payment_id is required" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured in environment");
    return res.status(500).json({ error: "Server not configured" });
  }

  try {
    const token = jwt.sign({ payment_id }, jwtSecret, { expiresIn: "2h" });

    return res.json({
      secure_link: `https://arunlive.com/secure-session?token=${token}`,
    });
  } catch (err) {
    console.error("Error generating token", err);
    return res.status(500).json({ error: "Failed to generate token" });
  }
});

// Secure session redirect — verifies token and redirects to Calendly when valid
app.get("/secure-session", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send("token is required");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET not configured");
    return res.status(500).send("Server not configured");
  }

  try {
    jwt.verify(token, jwtSecret);
    // Token valid → redirect to Calendly (replace with real link)
    return res.redirect("https://calendly.com/linksvardha/60min");

  } catch (err) {
    return res.status(403).send("⛔ Session Access Denied");
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running on port " + port));
