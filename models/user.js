const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremium: {
    type: Boolean,
  },
  totalAmount: {
    type: Number,
  },
});

userSchema.methods.updateTotalAmount = function (amount) {
  this.totalAmount = amount;
  return this.save();
};

userSchema.methods.updatePaymentStatus = function () {
  this.isPremium = true;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const Sequelize = require('sequelize')
// const sequelize = require('../database/database')

// const User = sequelize.define('user', {
//     id : {
//         type : Sequelize.INTEGER,
//         autoIncrement : true,
//         notNull : true,
//         primaryKey : true
//     },
//     name : {
//         type : Sequelize.STRING,
//         notNull : true
//     },
//     email : {
//         type : Sequelize.STRING,
//         unique : true
//     },
//     password : {
//        type : Sequelize.STRING,
//        notNull : true
//     },
//     isPremium : Sequelize.BOOLEAN,
//     totalAmount : Sequelize.INTEGER
// })

// module.exports = User
