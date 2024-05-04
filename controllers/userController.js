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


exports.updateUser = catchAsync(async(req,res,next) =>{

    //Dont accept any other field from request than the below! 
    const updatedData = {
        name: req.body.name, 
        email: req.body.email, 
        //REMOVE THIS LATAR!should be updated automatically 
        passwordChangedAt: req.body.passwordChangedAt
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedData, {new:true, runValidators:true})

    console.log('UPDATE USER: the updated user in db:')
    console.log(updatedUser)

    res.status(200).json({
        status:'success', 
        data:{
            user:updatedUser
        }
    })
    //6636149d9deae7e667ddb6b6
    // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body)
})