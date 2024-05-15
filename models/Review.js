
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


//STATIC METHOD 
//this points to the current Model instance - not current Document
//=> I CAN CALL this.aggregate() static method of a Model
//(since not related to a specific Model and more easy to chain methods - and organized code)
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  
  
  //STEP 1: BUILD THE AGGREGATE PIPE LINE - TO FIND #REVIEWS AND THEIR AVERAGE FOR THE CURRENT TOUR PARENT
  const stats = await  this.aggregate([

    
    //Stage 1: Match - Select only  reviews for the current tour
    {
        $match: {tour: tourId}

    }, 
    //Stage 1.2: GROUP  -Group all reviews by the tour field => _id = tour
    //Count  each review from the match:  step($sum: 1)
    //Compute the average of the rating field for all reviews form the match step: {$avg: '$rating'}
    {
        $group:{
            _id: '$tour',
            nRating: { $sum: 1},
            avg: {$avg: '$rating'}
        }
    }

   ])


   console.log(stats)


   //STEP 2: UPDATE TOUR PARENT WITH THE STATS - the ratingsAverage field!
}


////////////////////////////
//PRE M.W 
//////////////////////////////

//PRE -SAVE M.W : TO TRIGGER THE calcAverageRatings function 
//this points to the current Review Doc
// => Can not call the static method  calcAverageRatings - on this!
//SOLUTION: Call the static and pass it the current doc (this)

reviewSchema.pre('save' , function(next) {

    //SUPER IMPORTANT - ACCESSING A STATIC METHOD BY AN INSTANCE - INDIRECTLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
    this.constructor.calcAverageRatings(this.tour)
    next();

    //THE ABOVE LINE IS THE SAME - DIRECT CALL TO STATIC METHOD -IMPOSSIBLE IN THIS CASE!
    // - BUT I CAN NOT USE THE BELOW LINE - SINCE Review instance model has not been created yet!
   // Review.calcAverageRatings(this.tour) 


})


const Review = mongoose.model('Review', reviewSchema)


module.exports = Review;