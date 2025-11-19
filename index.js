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
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (!payment_id) return res.status(400).json({ error: "payment_id is required" });

  try {
    const token = jwt.sign(
      { payment_id, ip }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ secure_link: `https://main-backend-dzf5.onrender.com/secure-session?token=${token}` });
    
  } catch {
    res.status(500).json({ error: "Failed to generate link" });
  }
});

// Secure Session Redirect
const usedTokens = new Set();

app.get("/secure-session", (req, res) => {
  const token = req.query.token;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (!token) return res.status(400).send("Token missing!");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);

    // One time usage rule
    if (usedTokens.has(token)) {
      return res.status(403).send("⛔ Access expired!");
    }

    // IP verification rule
    if (data.ip !== ip) {
      return res.status(403).send("⛔ Invalid Device or IP!");
    }

    // Mark token as used
    usedTokens.add(token);

    // redirect
    return res.redirect("https://calendly.com/linksvardha/60min");

  } catch (err) {
    return res.status(403).send("⛔ Session Access Denied");
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running on port " + port));