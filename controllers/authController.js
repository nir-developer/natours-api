
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')
//const cookieParser = require('cookie-parser')
const {promisify} = require('util')

const jwt = require('jsonwebtoken')

const crypto = require('crypto');
const cookieParser = require('cookie-parser');


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //TEST IN THE RESPONSE HEADER IF THERE IS A Header: Set-Cookie with the token value
  res.cookie('jwt', token, cookieOptions);


   res.cookie('httpOnlyCookieName','cookieValue', {
    httpOnly:true
  });
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    //In the beginning I sent the toke as a simple string in the request body!
    token,
    message:'HTTPOnly Cookie Set',
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req,res,next) =>{

    const newUser = await User.create({
        
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    }
    ); 

    createSendToken(newUser, 201, res)
    
})



exports.login = catchAsync(async (req,res,next)=>{
    
    //1)CHECK IF PASSWORD AND EMAIL EXISTS IN THE REQUESTS
    const {email, password} = req.body ;

    if(!email || !password) return next(new AppError("Please provide email and password!", 400))
    

    //2) CHECK IF USER EXISTS IN DB AND PASSWORD IS CORRECT(ES6)
    const user = await User.findOne({ email }).select('+password');
    
  
     if(!user || !await user.correctPassword(password, user.password)) 
        next(new AppError('Incorrect email or password', 401))

    console.log('SUCCESS LOGIN')
    //3) If all good - send token to the client
    createSendToken(user, 200, res)
  
})


//IMPLEMENTING PROTECTED ROUTES USING EXPRESS M.W - the 4 steps!
exports.protect = catchAsync(async (req,res,next) =>{
    
    //OK
    console.log('INSIDE PROTECT M.W: HTTP headers:', req.headers.authorization)

    let token;


   
    //STEP 1:  Getting token from request.headers object and check if it's there(Express make it lower case!)
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1]; 
    }
    
    

    if(!token) return next(new AppError('You are not logged in! Please log in to get access.', 401))
 
    //2)jwt.verify Verify the token(THIS VERIFICATION STEP - MAKES SURE NO TEMPER AND NO EXPIRATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); 
    

    //STEP 3:  Check if user still exists 
    const currentUser = await User.findById(decoded.id)

    if(!currentUser) return next(new AppError('The user belonging to this token does no longer exist.', 401))

 
   
    //STEP 4: CHECK IF USER HAS RECENTLY CHANGED HIS PASSWORD(AFTER THE JWT WAS ISSUED)
    if(currentUser.changedPasswordAfter(decoded.iat))
    {
         return next(new AppError('User recently changed password! Please log in again', 401))
    }

    req.user = currentUser; 

     next();


}
)

exports.restrictTo = (...roles) => {
    
    //Return the desired M.W - that takes arguments
    return (req,res,next) => {
       
       //HAS ACCESS TO THE roles REST PARAMS - SINCE CLOUSRE
        if(!roles.includes(req.user.role))
        {
            return next(new AppError('You are not authorized!', 403))
        } 

         next();
    }

}


/////////////////////////
//PASSWORD RESET FUNCTIONALITY 
exports.forgotPassword = catchAsync(async (req,res,next) =>{

    //1) GET USER BASED ON POSTED EMAIL 
    const user = await User.findOne({email:req.body.email})
    console.log(user)
    if(!user) return next(new AppError('There is no user with that email address', 404))
    
    
    //2) GENERATE THE RANDOM RESET TOKEN(modify the model instance) - AND SAVE  IT!!
    const resetToken = user.createPasswordResetToken(); 

   
     const updatedUser = await user.save({validateBeforeSave:false})


    //3) SENT THE RESET TOKEN TO USER'S EMAIL

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password, and 
    password confirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email`

    try 
    {

    await sendEmail({
        email:user.email, 
        subject: 'Your password reset token(Valid for 10 mins', 
        message
    })
   
  
   res.status(200).json({
        status:'success', 
        message:'Token sent to email'
    })
    }
    catch(err)
    {
        //Reset the reset token and expiracy !
        user.passwordResetToken = undefined; 
        user.passwordResetExpires = undefined;

       await  user.save({validateBeforeSave:false})


       return next(new AppError('There was an error sending the email. Try again later!', 500))

    }
})



 exports.resetPassword = catchAsync(async (req,res,next) =>{
   
    console.log('PLAIN TEXT TOKEN FROM REQUEST URL')
    console.log(req.params.token)

    //STEP 1: Get User based on the token (embedded in URL path)
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    console.log('HASHED TOKEN FROM REQUEST URL - SHOULD BE THE SAME AS IN THE DB - FOR THE NEXT 10 MINS')
    console.log(hashedToken)

   
    const user = await User.findOne({
            passwordResetToken:hashedToken, 
            passwordResetExpires: {$gt: Date.now()}
        })


    if(!user) 
        return next(new AppError('Token is invalid or has expired', 400))
   

    //STEP 2: If token is not expired and there is a user - set the new password
    user.password = req.body.password; 
    user.passwordConfirm = req.body.passwordConfirm
    

    //STEP 3.Update changedPassword property of the user - CHECK!! !!!!!!!!!!!!!!!
     user.passwordResetToken = undefined; 
     user.passwordResetExpires=undefined;

    await user.save() ; 
    

    //4. Log the user in (send the JWT to the client)
   createSendToken(user, 200, res)

})


exports.updateMyPassword = catchAsync(async(req,res,next) =>{

    //STEP 1: Get user from collection based on the id - THE USER MUST BE LOGGED IN ! THE ID STORED IN THE req.user ! by the protect M.W!!()
     const user = await User.findById(req.user.id).select('+password') 
     console.log('updatePassword - user from db before updating password:')
     console.log(user)


     
     // // STEP 2: CHECK IF POSTED  CURRENT PASSWORD IS CORRECT 
     if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) 
     {
         
         return next(new AppError('Your current password is wrong.', 401))
       
     }
        
     // // // STEP 3:IF SO- UPDATE THE PASSWORD
     user.password = req.body.password; 
     user.passwordConfirm = req.body.passwordConfirm; 
    
     await user.save() ; 

        

    // // //STEP 4: LOGIN USER - CREATE JWT AND SEND IT IN THE RESPONSE
     createSendToken(user, 200, res)
    
})



