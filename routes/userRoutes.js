const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const express = require('express')

const router = express.Router();

//AUTHENTICATION END POINTS(NOT REST)
// router.route('/signup').post(authController.signup );
router.post('/signup', authController.signup)
router.post('/login', authController.login)



////////////////
//PASSWORD RESET ENDPOINTS

//STEP 1/2(request contains the email - response sends an email with a link that contains the reset token)
router.post('/forgotPassword', authController.forgotPassword)

//STEP 2/2 :request contains the reset token and the new password user wants - 
//PATCH : SINCE I UPDATE ONLY THE PASSWORD FIELD IN THE USER DOCUMENT
//NOTE: THE BELOW URL IS THE URL OF THE LINK SENT TO THE USER EMAIL FORM THE HANDLER of the previous /forgotPassword end point 
// - IT HAS THE EMBEDDED RESET TOKEN(plain text)
router.patch('/resetPassword/:token', authController.resetPassword)


router.patch('/updateMyPassword',authController.protect,  authController.updateMyPassword)


router.patch('/updateMe', authController.protect, userController.updateMe)

router.delete('/deleteMe', authController.protect, userController.deleteMe)






//////////////
//REST END POINTS FOR USER MANAGEMENT!!!!!
// - ONLY FOR ADMIN ROLE USER- LATER!!!!
//IMPORTANT: I WANT THE ADMING TO BE ABLE DELETING ANY TYPE OF RESOURCE(USER, TOUR ,ETC..)

 router.route('/' )
 .post(authController.protect, authController.restrictTo('admin'), userController.createUser)
 .get(authController.protect, userController.getAllUsers)


 router.route('/:id')
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        userController.deleteUser)
 



module.exports = router;