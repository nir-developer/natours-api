
const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({

    review:{
        type:String, 
        required:[true, 'Review can not be empty']
    },

    //WHY NOT REQUIRED??
    rating:{
        type:Number, 
        //required:[true, 'A review must have a rating'], 
        min:1, 
        max:5
    },

    createdAt:{
        type: Date, 
        // default:Date.now()
        default:Date.now
    },

    //PARENT REFERENCING TO THE 2 PARENTS(tour , user)
    user: {
        type:mongoose.Schema.ObjectId, 
        ref:'User',
        required:[true, 'Review must belong to belong user'], 
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref:'Tour', 
        required:[true, 'Review must belong to  a tour'], 
    }
},

//SCHEMA OPTIONS - ADD VIRTUAL PROPERTIES TO RESULT SET WITH JSON AND OBJECT FORMATS
{
    toJSON:true, 
    toObject:true
}
)

//PREPOPULATE QUERY OF THE USER AND TOUR 
//REMOVE THE POPULATE OF THE TOURS ON THE REVIEW - SINCE POPULATE CHAIN RECURSION PROBLEM
    //NOTE - ITS MORE CORRECT TO HAVE THE REVIEWS AVAILABLE ON THE TOURS THAN HAVING THE TOURS AVAILABLE ON THE REVIEW
    // this.populate({
    //     path:'tour', 
    //     select:'name'
    // }).populate({
    //     path:'user', 
    //     //DONT LEAK THE REVIEWS  SENSITIVE DATA - AS EMAIL! 
    //     select:('name photo')
    // })
reviewSchema.pre(/^find/, function(next){

    //this - current Query - Review.find({}) 
    this.populate({
        path:'user',
        select:('name photo')
    })



    

    next()
    
})



const Review = mongoose.model('Review', reviewSchema)


module.exports = Review;