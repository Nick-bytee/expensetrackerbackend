const express = require('express')
const router = express.Router()

const passwordController = require('../controllers/password')

router.post('/forgotPassword', passwordController.sendMail)

router.get('/resetPassword/:uuid', passwordController.resetPassword)

router.post('/updatePassword/:id', passwordController.updatePassword)

module.exports = router