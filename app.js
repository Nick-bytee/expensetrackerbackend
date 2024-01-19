const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cors = require("cors");

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(cors());

const purchaseRoute = require("./routes/purchase");
const expenseRoute = require("./routes/expense");
const userRoute = require("./routes/users");
const passwordRoute = require("./routes/password");

const accessFileStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessFileStream }));

app.use("/password", passwordRoute);
app.use("/purchase", purchaseRoute);
app.use("/users", userRoute);
app.use("/expense", expenseRoute);

app.use(express.static(path.join(__dirname, "views")));
// Handle the default route ("/") separately
app.use("/", (req, res) => {
  const filePath = path.join(__dirname, `/${req.url}`);
  res.sendFile(filePath);
});

mongoose
  .connect(process.env.URI)
  .then(console.log("Database Connected"), app.listen(3000))
  .catch((err) => {
    console.log(err);
  });
