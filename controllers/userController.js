const catchAsync = require('../utils/catchAsync')
const User = require('../models/User')


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