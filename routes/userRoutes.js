const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const express = require('express')

const router = express.Router();

//AUTHENTICATION END POINTS(NOT REST)
// router.route('/signup').post(authController.signup );
router.post('/signup', authController.signup)
router.post('/login', authController.login)



//REST END POINTS FOR USER MANAGEMENT - LATER!!!!
router.post('/',userController.createUser ).get('/', userController.getAllUsers)

module.exports = router;