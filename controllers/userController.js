const catchAsync = require('../utils/catchAsync')
const User = require('../models/User')
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) =>{

    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })

    return newObj;
}


//FOR EFFECTIVELY DELETE USER FROM DB - BY THE ADMIN!
exports.deleteUser = factory.deleteOne(User)

//IMPORTANT!!!!! DO NOT UPDATE PASSWORDS WITH THIS!(SINCE PASSWORD UPDATE IS IMPLEMENTED IN A DIFFERENT FUNCTIONALITY THAT USES PRE-SAVE M.W !!)
exports.updateUser = factory.updateOne(User); 


///NOTE: AS FOR ALL USER WITH ANY ROLE - THE PASSWORD IS HASHED IN THE USER MODEL PRE-SAVE M.W!!
exports.createUser = catchAsync(async(req,res,next) =>{

    //EXTRACT ALL FIELDS - INCLUDES ROLES!
    const newUser = await User.create(req.body)

    console.log(newUser)

    res.status(201).json({
        status:'success', 
        data:{
            user:newUser
        }
    })

})

exports.getAllUsers = catchAsync(async(req,res,next) =>{

    const users = await User.find(); 
    console.log(users)

    res.status(200).json({
        status:'success', 
        results:users.length, 
        data:{
            users
        }
        
    })
})


exports.updateMe = catchAsync(async(req,res,next) =>{

    //STEP  1: Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm)
        return next(new AppError('This route is not for password updates.Please use /updateMyPassword', 400))


    ///FILTERED OUT UNWANTED FIELDS NAMES THAT ARE NOT ALLOWED BE UPDATED!(LIKE ROLE,..)
    const filteredBody = filterObj(req.body, 'name', 'email'); 

   //STEP 2: UPDATE USER ACCOUNT
    const updatedUser = await User.findByIdAndUpdate(req.user.id ,filteredBody, {
        new:true, 
        runValidators:true
    })

    console.log(updatedUser)


    res.status(200).json({
        status:'success', 
        data:{
            user:updatedUser
        }
    })

})


//USED BY THE CURRENT LOGGED IN USER - DOES NOT REMOVE THE CURRENT USER - JUST DEACTIVEATE
exports.deleteMe = catchAsync(async(req,res,next) =>{
    
    //"REMOVE" - THE CURRENT LOGGED IN ACCOUNT
    await User.findByIdAndUpdate(req.user.id, {active: false})


    res.status(204).json({
        status:'success' ,
        data:null
    })

})







