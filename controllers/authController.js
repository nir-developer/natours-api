
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')


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
 


    //2) Verify the token(using the jwt.verify)

    //3) Check if user still exists 

    //4) Check if user changed password after the token was issued

     next();


    //TEST THE DIFFERENT:
   // throw new AppError('XX')
    //next(new AppError('XX'));
}
)