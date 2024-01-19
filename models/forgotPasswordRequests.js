const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema({
  uuid: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: Boolean,
});

module.exports = mongoose.model(
  "ForgotPasswordRequest",
  forgotPasswordRequestSchema
);
