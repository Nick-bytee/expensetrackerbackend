const express = require('express')
const router = express.Router()

const authController = require('../middleware/auth')
const purchaseController = require('../controllers/purchase')

router.get('/purchaseMembership', authController.authenticate, purchaseController.purchaseMembership)

router.post('/updateTransactionStatus', authController.authenticate, purchaseController.updateTransactionStatus)

module.exports = router