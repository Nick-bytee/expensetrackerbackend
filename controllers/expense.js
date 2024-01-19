const Expense = require("../models/expense");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const DownloadHistory = require("../models/downloadHistory");
require("dotenv").config();

exports.leaderboardData = async (req, res) => {
  const result = await User.find({})
    .select("name totalAmount")
    .sort({ totalAmount: -1 })
    .lean();
  console.log(result);
  res.status(200).json(result);
};

exports.storeData = async (req, res) => {
  try {
    const amount = req.body.amnt;
    const expense = new Expense({
      amount: amount,
      description: req.body.desc,
      category: req.body.cate,
      userId: req.user,
    });
    await expense.save();
    const newUserData = await User.findById(req.user._id);
    const oldExpense = newUserData.totalAmount;
    const totalExpense = oldExpense + +amount;

    await User.findByIdAndUpdate(req.user._id, {
      totalAmount: totalExpense,
    });
    res.status(200).json({ success: true, message: "Created Successfully" });
  } catch (err) {
    console.log(err);
  }
};

exports.getData = async (req, res) => {
  const user = req.user;
  const ITEMS_PER_PAGE = parseInt(req.query.count) || 10;
  const page = req.query.page || 1;
  try {
    const totalItems = await Expense.countDocuments({
      userId: user._id,
    });

    const expenses = await Expense.find({
      userId: user._id,
    })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .exec();
    if (user.isPremium) {
      res.status(200).json({
        expenses,
        userName: user.name,
        isPremium: true,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: 1 + +page,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        currentPage: page,
      });
    } else {
      res.status(200).json({
        expenses,
        userName: user.name,
        isPremium: false,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: 1 + +page,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        currentPage: page,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.deleteData = async (req, res) => {
  const uid = req.user._id;
  const id = req.params.id;
  try {
    const user = await User.findById(uid).lean();
    const previousAmount = user.totalAmount;
    const expenseData = await Expense.findById(id);
    const data = await Expense.findByIdAndDelete(id);
    console.log(previousAmount, expenseData.amount);
    const totalAmount = previousAmount - expenseData.amount;
    await req.user.updateTotalAmount(totalAmount);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};

// exports.generateReport = async (req, res) => {
//   try {
//     const user = req.user
//     const expenses = await Expense.find({
//       userId: user._id,
//     });
//     const data = JSON.stringify(expenses);
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const day = date.getDate();
//     const name = `Expense ${year.toString()}${month
//       .toString()
//       .padStart(2, "0")}${day.toString().padStart(2, "0")}`;
//     const fileName = `Expenses ${user._id}/${name}.txt`;
//     const fileURL = await downloadReport(data, fileName);
//     req.user.createDownloadHistory({
//       fileURL: fileURL,
//       fileName: name,
//     });
//     if (!fileURL) {
//       throw new Error();
//     } else {
//       res.status(200).json({ URL: fileURL });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "An Error Occured" });
//   }
// };

// async function downloadReport(data, filename) {
//   let s3Bucket = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   });

//   return new Promise((resolve, reject) => {
//     s3Bucket.createBucket(() => {
//       var params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ACL: "public-read",
//         ContentType: "text/csv",
//       };
//       s3Bucket.upload(params, (err, response) => {
//         if (err) {
//           console.log(err);
//           reject();
//         } else {
//           resolve(response.Location);
//           console.log(response);
//         }
//       });
//     });
//   });
// }

// exports.getDownloadHistory = async (req, res) => {
//   try {
//     const response = await DownloadHistory.findAll({
//       where: { userId: req.user.id },
//     });
//     res.status(200).json({
//       data: response,
//       isPremium: req.user.isPremium,
//       userName: req.user.name,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.updateExpense = async (req, res) => {
  const id = req.params.uid;
  try {
    Expense.findByIdAndUpdate(id, {
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};
