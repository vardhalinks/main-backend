import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 Razorpay keys (replace with your own)
const razorpay = new Razorpay({
  key_id: "rzp_test_RfEZA7cY0icEUx", // YOUR_KEY_ID
  key_secret: "j8CQrjDHuDKJGa4mHg50oea1", // YOUR_KEY_SECRET
});

// ✅ Create Order API
app.post("/create-order", async (req, res) => {
  try {
    // Log the Razorpay key id for debugging as requested
    console.log("Creating order with Razorpay key:", razorpay.key_id);
    const options = {
      amount: req.body.amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});

// ✅ Verify Payment API
import crypto from "crypto";

app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", "YOUR_KEY_SECRET")
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.json({ success: false, message: "Payment verification failed" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running on port " + port));
