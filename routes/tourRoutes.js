const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const express = require('express')

const tourRouter = express.Router(); 

//ALIAS ROUTE - FOR THE USER TO GET POPULAR RESOURCE WITH EASY TO REMEMBER URL AND PREPOPULATED QUERY STRINGS! 
tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)


//////////////////
//STATS ROUTE - AGGREGATION PIPELINE
tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


///////////////
//API (get is the API features)
tourRouter.route('/')
.get(authController.protect, tourController.getAllTours) 
.post(authController.protect, tourController.createTour) 

tourRouter.route("/:id")
    .get(tourController.findTour)
    .patch(tourController.updateTour)
    //restrictTo "m.w" :a wrapper function takes roles args - and returns my m.w (template) that takes the roles (since can not pass to a m.w parameters)
    .delete( 
         authController.protect,
         authController.restrictTo('admin','lead-guide'), 
         tourController.deleteTour)


        


module.exports = tourRouter;