const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  paymentId: {
    type: String,
  },
  orderId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);

// const Sequelize = require("sequelize");
// // const sequelize = require('../database/database')

// const Order = sequelize.define("order", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     notNull: true,
//     primaryKey: true,
//   },
//   paymentId: Sequelize.STRING,
//   orderId: Sequelize.STRING,
//   status: Sequelize.STRING,
// });

// module.exports = Order;
