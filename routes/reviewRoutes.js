const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const express = require('express')


const reviewRouter = express.Router();


reviewRouter
    .route('/')
    ///PUBLIC END POINT
    .get( reviewController.getAllReviews)
    //PROTECTED END POINT - RESTRICTED ONLY FOR NORMAL USERS(customers)
    .post(
        authController.protect, 
        authController.restrictTo('user') ,
        reviewController.createReview)


module.exports = reviewRouter;