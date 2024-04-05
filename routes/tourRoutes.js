const tourController = require('../controllers/tourController')
const express = require('express')

const tourRouter = express.Router(); 

//ALIAS ROUTE - FOR THE USER TO GET POPULAR RESOURCE WITH EASY TO REMEMBER URL AND PREPOPULATED QUERY STRINGS! 
tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)

tourRouter.route('/')
    .post(tourController.createTour) 
    .get(tourController.getAllTours) 

tourRouter.route("/:id")
    .get(tourController.findTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)




module.exports = tourRouter;