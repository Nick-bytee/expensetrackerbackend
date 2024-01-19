const Users = require("../models/user");
const jwt = require("jsonwebtoken");

exports.authenticate = async (req, res, next) => {
  const token = await req.header("Auth");
  try {
    const user = jwt.verify(token, "secretkey");
    if (user) {
      const userData = await Users.findById(user.userID);
      req.user = userData;
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
