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
.post(tourController.createTour) 

tourRouter.route("/:id")
    .get(tourController.findTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)




module.exports = tourRouter;