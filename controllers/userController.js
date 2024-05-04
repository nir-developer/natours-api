const catchAsync = require('../utils/catchAsync')
const User = require('../models/User')



exports.getAllUsers = catchAsync(async(req,res,next) =>{


    const users = await User.find();


    res.status(200).json({
        status:'success', 
        data:
        {
            results:users.length, 
            users
        }
    })
})


exports.createUser = catchAsync(async (req,res,next) =>{

    const newUser = await User.create({
        name:req.body.name, 
        email:req.body.email, 
        password: req.body.password, 
        passwordConfirm: req.body.passwordConfirm
    })



    res.status(201).json({
        status:'success', 
        data:
        {
            user:newUser
        }
    })

})