const catchAsync = require('../utils/catchAsync')
const Review = require('../models/Review')
// const User = require('../models/User')
// const Tour = require('../models/Tour')



exports.createReview= catchAsync(async (req,res,next) =>{


    //ALLOW NESTED ROUTES
    //FIRST CHECK IF THE tour id and user id passed manually by the client in the request body(GOOD FOR DEVELOPMENT)
    //IF NOT TAKE USER ID FROM THE CURRENTLY LOGGED IN USER AND TOUR ID FROM THE URL(IDEAL SOLUTION! REAL WORLD - THIS IS HOW IT WORKS!)
    if(!req.body.tour) req.body.tour = req.params.tour;
    if(!req.body.user) req.body.user = req.user.id


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