const tourController = require('../controllers/tourController')
const express = require('express')

const tourRouter = express.Router(); 


tourRouter.route('/')
    .post(tourController.createTour) 
    .get(tourController.getAllTours) 

tourRouter.route("/:id")
    .get(tourController.findTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)




module.exports = tourRouter;