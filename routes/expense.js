const express = require("express");
const router = express.Router();

const mainController = require("../controllers/expense");
const authController = require("../middleware/auth");

router.post(
  "/addExpense",
  authController.authenticate,
  mainController.storeData
);

router.get("/getExpenses", authController.authenticate, mainController.getData);

router.delete(
  "/deleteExpense/:id",
  authController.authenticate,
  mainController.deleteData
);

// router.put('/updateExpense/:uid', mainController.updateExpense)

router.get("/leaderboard", mainController.leaderboardData);

router.get("/getReport", authController.authenticate, mainController.getData);

// router.get(
//   "/downloadReport",
//   authController.authenticate,
//   mainController.generateReport
// );

// router.get(
//   "/getDownloadHistory",
//   authController.authenticate,
//   mainController.getDownloadHistory
// );

module.exports = router;
