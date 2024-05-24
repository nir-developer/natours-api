const viewsController = require('../controllers/viewsController')

const express = require('express')

const router = express.Router(); 

///- for rendering HTML - use GET
// - NO NEED TO SPECIFY THE FULL PATH - JUST THE TEMPLATE NAME WITH NO EXTENSION - EXPRESS WILL GO TO THE views folder!
router.get('/', viewsController.getOverview)


router.get('/overview', (req,res) =>{
    res.status(200).render('overview', {
        title: 'XXX'
    })
})

router.get('/tour', viewsController.getTour)


module.exports = router;