const RazorPay = require("razorpay");
const Order = require("../models/order");
require("dotenv").config;

exports.purchaseMembership = async (req, res) => {
  try {
    const rzp = new RazorPay({
      key_id: process.env.RZP_KEYID,
      key_secret: process.env.RZP_SECRET,
    });

    const amount = 2500;
    const orderPromise = new Promise((resolve, reject) => {
      rzp.orders.create(
        {
          amount,
          currency: "INR",
        },
        (err, order) => {
          if (err) {
            reject(err);
          } else {
            resolve(order);
          }
        }
      );
    });

    const orderData = await orderPromise;

    const newOrder = new Order({
      orderId: orderData.id,
      status: "PENDING",
      userId: req.user,
    });

    await newOrder.save();

    return res.status(201).json({
      order: newOrder.orderId,
      key_id: process.env.RZP_KEYID,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const payment_id = req.body.paymentId;
    console.log(payment_id);
    const order_id = req.body.order_id;
    const status = req.body.status;
    if (status) {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentId: payment_id,
          status: "SUCCESS",
        }
      );
      await req.user.updatePaymentStatus();
      res.status(200).json({
        success: true,
        message: "Transaction Successful",
      });
    } else {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentId: payment_id,
          status: "FAILED",
        }
      );
      await req.user.updatePaymentStatus();
      res.status(200).json({
        success: false,
        message: "Transaction Failed",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
