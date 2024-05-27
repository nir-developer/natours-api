const authController = require('../controllers/authController')
const viewsController = require('../controllers/viewsController')

const express = require('express')

const router = express.Router(); 


//REGISTER THE isLoggedIn M.W BEFORE ALL RENDERING ROUTES! 
router.use(authController.isLoggedIn)


///- for rendering HTML - use GET
// - NO NEED TO SPECIFY THE FULL PATH - JUST THE TEMPLATE NAME WITH NO EXTENSION - EXPRESS WILL GO TO THE views folder!
router.get('/', viewsController.getOverview)



//BASED ON THE URL IN THE OVERVIEW PAGE ON THE BUTTON LINK!
// router.get('/tour/:slug',authController.protect, viewsController.getTour)

router.get('/tour/:slug', viewsController.getTour)

////////////////////////
//LOGIN ROUTES
router.get('/login', viewsController.getLogin)

module.exports = router;