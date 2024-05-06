const catchAsync = require('../utils/catchAsync')
const User = require('../models/User')


const filterObj = (obj, ...allowedFields) =>{

    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })

    return newObj;
}

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





