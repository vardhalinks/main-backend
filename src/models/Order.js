import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true, unique: true },
  razorpay_payment_id: { type: String },
  amount: { type: Number },
  currency: { type: String, default: "INR" },
  receipt: { type: String },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
