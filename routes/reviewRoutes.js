const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const express = require('express')

//NESTED ROUTES  - EXAMPLE 
//POST tours/3234234/reviews 
//GET tours/343432/reviews 
//GET tours/343433/reviews/3423

//EXPRESS NESTED ROUTES - SINCE I NEED ACCESS TO THE tourId in the nested route : tours/tourId/reviews/
const reviewRouter = express.Router({
    mergeParams:true
});



//ALL THE ABOE NESTED ROUTES - WILL BE  REDIRECTED  TO THE CURRENT ROUTE OF THE REVIEWS: '/'
reviewRouter
    .route('/')
    .get( reviewController.getAllReviews)
    .post(
        authController.protect, 
        authController.restrictTo('user') ,
        reviewController.createReview)


module.exports = reviewRouter;