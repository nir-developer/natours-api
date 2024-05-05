
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')


const {promisify} = require('util')

const jwt = require('jsonwebtoken')


//UTIL FUNCTION TO BE USED IN BOTH signup and login for creating(SIGNING)  a JWT 
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


exports.signup = catchAsync(async (req,res,next) =>{

    //DONT READ OTHER REQUEST FIELDS COMMING FROM THE USER!!(like roles etc..)
    const newUser = await User.create({
        
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    }
    ); 


    const token = signToken(newUser._id);
   

    console.log(token)
    
    console.log(newUser); 

    res.status(201).json({
        status:'success', 
        token,
        data:{
            user:newUser
        }
    })
})



exports.login = catchAsync(async (req,res,next)=>{
    
    //1)CHECK IF PASSWORD AND EMAIL EXISTS IN THE REQUESTS
    const {email, password} = req.body ;

    if(!email || !password) return next(new AppError("Please provide email and password!", 400))
    
    console.log(email, password)
    
    
    //2) CHECK IF USER EXISTS IN DB AND PASSWORD IS CORRECT(ES6)
    //Only for this authentication step !!! Explicity read the password (I set to be not selected by default -  in the schema) 
    //FROM DB TO GET IT THE OUTPUT OF THE QUERY  
    const user = await User.findOne({ email }).select('+password');
    
  
     if(!user || !await user.correctPassword(password, user.password)) 
        next(new AppError('Incorrect email or password', 401))

   
    //3) If all good - send token to the client
    let token = signToken(user._id)


    res.status(200).json({
        status:'success', 
        token
    })
})


//IMPLEMENTING PROTECTED ROUTES USING EXPRESS M.W - the 4 steps!
exports.protect = catchAsync(async (req,res,next) =>{
    
    let token;
   
    //STEP 1:  Getting token from request.headers object and check if it's there(Express make it lower case!)
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1]; 
    }
    
    if(!token) return next(new AppError('You are not logged in! Please log in to get access.', 401))
 
    //2)jwt.verify Verify the token(THIS VERIFICATION STEP - MAKES SURE NO TEMPER AND NO EXPIRATION)
    //=> AFTER THIS STEP - I CAN BE SURE THAT THE ID IN THE PAYLOAD OF THE PROVIDED JWT IS THE ID OF THE JWT I WAS CREATED FOR THIS USER!!
    //(jwt library will create the Test Signature - and compare it with the incoming jwt's signature)
    //PROMISIFY THE VERIFY ASYNC FUNCTION - AND EXTRACT THE RESOLVED VALUE(if success) - THE JWT PAYLOAD!
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); 
    
    //DECODED PAYLOAD: { id: '6635d561994ee62b6b4f2b0d', iat: 1714806421, exp: 1722582421 }
    console.log(decoded)

    //STEP 3:  Check if user still exists 
    //User was deleted (the JWT still existed - so I should not let anyone to login with this jwt!)
    const currentUser = await User.findById(decoded.id)

    if(!currentUser) return next(new AppError('The user belonging to this token does no longer exist.', 401))

    console.log('THE USER  FROM DB WITH THE ID OF THE JWT')
    console.log(currentUser)

    //STEP 4: CHECK IF USER HAS RECENTLY CHANGED HIS PASSWORD(AFTER THE JWT WAS ISSUED)
    if(currentUser.changedPasswordAfter(decoded.iat))
    {
         return next(new AppError('User recently changed password! Please log in again', 401))
    }


    //Update the request - add the logged in user 
    req.user = currentUser; 
    

     next();


    //TEST THE DIFFERENT:
   // throw new AppError('XX')
    //next(new AppError('XX'));
}
)

/**
 * PASSING ARGUMENT TO M.W - USING A WRAPPER FUNCTION THAT RETURNS THE M.W I WANT TO TAKE ARGS!
 * USING THE REST PARAMETER SYNTAX: ...roles => Create an array 

 */
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
    
    console.log('----------')
    console.log('CONTROLLER')
    console.log(user);
    
    //2) GENERATE THE RANDOM RESET TOKEN(modify the model instance) - AND SAVE  IT!!
    const resetToken = user.createPasswordResetToken(); 

    //SUPER IMPORTANT! - DISABLE THE VALIDATORS - TO BE ABLE SAVING THE INCOMING  PARTIAL DATA(THE EMAIL)
    //const updatedUser = await user.save() -> WILL THROW VALIDATION ERRORS!
     const updatedUser = await user.save({validateBeforeSave:false})
    console.log(updatedUser)


    //3) SENT THE RESET TOKEN TO USER'S EMAIL

    res.status(200).json({
        status:'success'
    })

}

)
exports.resetPassword = (req,res,next) =>{

}