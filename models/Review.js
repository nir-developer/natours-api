const Tour = require('./Tour')
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

//////////////////////////////////////////////////////////
//QUERY - PRE-FIND M.W -TO PREPOPULATE  THE TOUR AND USER
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


reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};



//JONAS - WORKS
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});




// findByIdAndUpdate
// findByIdAndDelete
//JONAS!!
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });


reviewSchema.post(/^findOneAnd/, async function (docs) {
  

    //OK!!
    //MUST CHECK IF THERE ARE DOCS DOCS AFTER MODIFYING THE DB WITH findOneAndXXX
    //OK! IF NO REVIEWS  DOCS IN DB AFTER UPDATE/DELETE
    // - THEN WHEN TRY TO UPDATE A NON EXISTING REVIEW - 404 - OK!
    if (docs) await docs.constructor.calcAverageRatings(docs.tour);
    

    //BAD 500!!
    //WILL THROW AN ERROR IF NO DOCS ARE IN THE DB AFTER MODIFIED THE DB - 500 - BAD
   // await docs.constructor.calcAverageRatings(docs.tour);
});

// reviewSchema.post(/^findOneAnd/, async function (docs) {
//   await docs.constructor.calcAverageRatings(docs.tour);
// });

// ///////////////////////////////////////////
// //STATIC METHOD  - TO AGGREGATE!(STATIC METHOD ON THE MODEL CONSTRUCTOR FUNCTION)
// //this points to the current Model instance - not current Document
// //=> I CAN CALL this.aggregate() static method of a Model
// //(since not related to a specific Model and more easy to chain methods - and organized code)
// reviewSchema.statics.calcAverageRatings = async function(tourId) {

  
//   //STEP 1: BUILD THE AGGREGATE PIPE LINE - TO FIND #REVIEWS AND THEIR AVERAGE FOR THE CURRENT TOUR PARENT
//   const stats = await  this.aggregate([

//     //Stage 1: Match - Select only  reviews for the current tour
//     {
//         $match: {tour: tourId}

//     }, 
//     //Stage 1.2: GROUP  -Group all reviews by the tour field => _id = tour
//     //Count  each review from the match - ($sum: 1)
//     //Compute the average of the rating field for all reviews form the match step: {$avg: '$rating'}
//     {
//         $group:{
//             _id: '$tour',
//             nRating: { $sum: 1},
//             avgRating: {$avg: '$rating'}
//         }
//     }

//    ])


//    console.log(stats)


//    //STEP 2: UPDATE TOUR PARENT WITH THE STATS - the ratingsAverage field!
//    await Tour.findByIdAndUpdate(tourId, {
//     //Aggregate returns an Array of object
//     ratingsQuantity:stats[0].nRating,
//     ratingsAverage:stats[0].avgRating
//    })
// }


// ////////////////////////////
// //PRE M.W 
// //////////////////////////////

// //PRE -SAVE M.W : TO TRIGGER THE calcAverageRatings function 
// //this points to the current Review Doc
// // => Can not call the static method  calcAverageRatings - on this!
// //SOLUTION: Call the static and pass it the current doc (this)
// reviewSchema.post('save' , function() {

//     //SUPER IMPORTANT - ACCESSING A STATIC METHOD BY AN INSTANCE - INDIRECTLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
//     this.constructor.calcAverageRatings(this.tour)
//     //next();

//     //THE ABOVE LINE IS THE SAME - DIRECT CALL TO STATIC METHOD -IMPOSSIBLE IN THIS CASE!
//     // - BUT I CAN NOT USE THE BELOW LINE - SINCE Review instance model has not been created yet!
//    // Review.calcAverageRatings(this.tour) 


// })



// //QUERY - PRE M.W 
// //REVIEW: findByInAndUpdate - is a shorthand of findOneAndUpdate({_id: tourId})
// //SUPER IMPORTANT: JONAS CODE DOES NOT WORK!(169)
// //SOLUTION OF Q.A (LECTURE 169) 
// //I SHOULD CALL this.model.findOne(this.getQuery) getQuery() on the current Query
// reviewSchema.pre(/^findOneAnd/, async function(next){


//     //FIRST CORRECT SOLUTION
//     //this.r = await this.clone().findOne();
    
//     //SECOND CORRECT SOLUTION:
//     this._original = await this.model.findOne(this.getQuery());



//     ///JONAS SOLUTION DOES NOT WORK
//     //AWAIT ! TO EXECUTE THE QUERY - TO GET THE RESOLVED REVIEW DOC
//     //this.r = await this.findOne();
//     // console.log(`Query PRE m.w: reviewDoc = ${this.reviewDoc}`)
//     // const r = await this.findOne();
//     // console.log(`Query PRE m.w: reviewDoc = ${r._id}`)
//     // console.log(this.r)

//     next();

// })


// // reviewSchemareviewSchema.post(/save|^findOneAnd/, async (doc) => {
// .post(/^findOneAnd/, async ()  => {
    
//     await doc.constructor.calcAverageRatings(doc.tour);

//     // if(this._original) 
//     // {
//     //     await this._original.constructor.calcAverageRatings(this._original.tour)
//     // }
// })

// //IMPORTANT PASSING DATA BETWEEN QUERY THE 2 QUERY M.W :
// // I PASSED THE Review DOC FROM THE QUERY PRE M.W ABOVE THIS THIS QUERY POST M.W 
// // reviewSchema.post(/^findOneAnd/,  function(){
    
// //     //console.log(`Query Post m.w: reviewDoc = ${this.r}`)

// //     this.r.calcAverageRatings(this.r.tour);

// //     //WRONG - I DONT R IS NOT THE  DOCUMENT!!!
// //    // this.r.constructor.calcAverageRatings(this.r.tour);


// // })

const Review = mongoose.model('Review', reviewSchema)


module.exports = Review;