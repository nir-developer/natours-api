const catchAsync = require('../utils/catchAsync')
const Review = require('../models/Review')
// const User = require('../models/User')
// const Tour = require('../models/Tour')



exports.createReview= catchAsync(async (req,res,next) =>{

    
    const review = await Review.create(req.body)

    console.log(review); 

    res.status(201).json({
        status:'success', 
        data:{
            review
        }
    })

})

//GREAT!
exports.getAllReviews = catchAsync(async (req,res,next)=>{

    const reviews =  await Review.find({})
    console.log(reviews);


    res.status(200).json({
        status:'success',
        results: reviews.length, 
        data:{
            reviews
        }
    })
})