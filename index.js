import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

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

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: "rzp_test_RfEZA7cY0icEUx",
  key_secret: "j8CQrjDHuDKJGa4mHg50oea1",
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
  const expectedSign = crypto.createHmac("sha256", razorpay.key_secret).update(sign).digest("hex");

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server running on port " + port));
