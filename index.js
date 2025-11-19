import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// CORS
app.use(cors({ origin: "*", methods: "GET,POST" }));
app.use(bodyParser.json());

// Root Route (required)
app.get("/", (req, res) => {
  res.send("Backend running OK!");
});

// Razorpay Setup (correct)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#A1",
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Payment
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.redirect("https://arunlive.com/success.html");
  } else {
    return res.redirect("https://arunlive.com/failed.html");
  }
});

// JWT Link Generator
app.post("/generate-link", (req, res) => {
  const { payment_id } = req.body;
  if (!payment_id) return res.status(400).json({ error: "payment_id is required" });

  try {
    const token = jwt.sign({ payment_id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ secure_link: `https://arunlive.com/secure-session?token=${token}` });
  } catch {
    res.status(500).json({ error: "Failed to generate link" });
  }
});

// Secure Session Redirect
app.get("/secure-session", (req, res) => {
  const token = req.query.token;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return res.redirect(`https://calendly.com/linksvardha/60min`);
  } catch (err) {
    return res.status(403).send("⛔ Session Access Denied");
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running on port " + port));