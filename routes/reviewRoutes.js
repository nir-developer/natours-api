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
        //THE BELOW M.W - MADE IT POSSIBLE TO REFACTOR TO createOne Factory
        reviewController.setTourUserIds,
        reviewController.createReview
       )
    


 //UPDATE AND DELETE REVIEWS: RESTRICTED TO USER AND ADMIN
reviewRouter
.route('/:id')
.delete(authController.protect, 
    //the admin and normal should be able to delete a review
        authController.restrictTo('user') ,
        reviewController.deleteReview
    )
.patch(
    reviewController.updateReview)
.get(reviewController.getReview)


module.exports = reviewRouter;