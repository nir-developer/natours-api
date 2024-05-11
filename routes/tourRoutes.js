const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
//const reviewController = require('../controllers/reviewController')
const reviewRouter = require('../routes/reviewRoutes')
const express = require('express')

const tourRouter = express.Router(); 


//NESTED ROUTE (LECTURE 158 - WITHOUT EXPRESS MERGE PARAMS! CONFUSING + DUPLICATE CODE)
    //NESTED ROUTES (LECTURE 158 - counter intuitive - logic for calling review controller  here in the tour routeer)
    //WILL BE FIXED NEXT LECTURE 159 - USING EXPRESS MERGE PARAMS!
   // tourRouter.route('/:tourId/reviews')
    // .post(
    //     authController.protect,
    //     authController.restrictTo('user'),
    //     reviewController.createReview
    //     )


///////////////////////////////////////////////////
//NESTED ROUTE - WITH EXPRESS!
////////////////////////////////////
//(express router  is a M.W  - LIKE the app! =>  Can call use on it)
//MOUNT THE /:tourId/reviews on the reviewRouter - "REROUTE INTO THE REVIEW ROUTER"
tourRouter.use('/:tourId/reviews', reviewRouter)






//ALIAS ROUTE - FOR THE USER TO GET POPULAR RESOURCE WITH EASY TO REMEMBER URL AND PREPOPULATED QUERY STRINGS! 
tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)


//////////////////
//STATS ROUTE - AGGREGATION PIPELINE
tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


///////////////
//API (get is the API features)
tourRouter.route('/')
///PUBLIC ROUTES!!
.get( tourController.getAllTours) 
.post(authController.protect, tourController.createTour) 

tourRouter.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    //restrictTo "m.w" :a wrapper function takes roles args - and returns my m.w (template) that takes the roles (since can not pass to a m.w parameters)
    .delete( 
         authController.protect,
         authController.restrictTo('admin','lead-guide'), 
         tourController.deleteTour)


    
module.exports = tourRouter;