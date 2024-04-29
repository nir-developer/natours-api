const mongoose = require('mongoose')
const slugify = require('slugify')




const tourSchema = new mongoose.Schema({
    name:{
        type:String, 
        required:[true, 'A tour must have a name'], 
        unique:true, 
        trim:true
    }, 
    //NOTE - I MUST HAVE THIS PROPERTY DEFINED HERE IN THE SCHEMA! 
    //OTHERWISE THE CODE IN THE PRE-SAVE M.W : this.slug = slugify(this.name...)
    //WILL NOT PERSIST THE DOC!
    slug:String, 
    duration:{
        type:Number, 
        required:[true, 'A tour must have a duration']
    }, 
    maxGroupSize:{
        type:Number, 
        required:[true, 'A tour must have a group size']
    }, 
    difficulty:{
        type:String, 
        required:[true, 'A tour must have a difficulty']
    }, 
    ratingsAverage:{
        type:Number, 
        default:4.5 ,
    }, 
    ratingsQuantity:{
        type:Number, 
        default:0 ,
    }, 
    price:{
        type:Number, 
        required:[true, 'A tour must have a price']
    }, 
    priceDiscount:Number, 
    summary:{
        type:String, 
        trim:true, 
        required:[true, 'A tour must have a description']
    }, 
    description:{
        type:String ,
        trim:true
    }, 
    imageCover:{
        type:String, 
        required:true
    } , 
    imageCover:{
        type:String, 
        required:[true, 'A tour must have a cover image']
    }, 
    images:[String], 
    createdAt:{
        type:Date, 
        //timestamp (m.s) - mo
        default:Date.now(),
        //EXCLUDE THIS FIELD FROM THE SCEMA - SO USER CAN NOT SEE IF TOUR IS OUTDATED
        select:false

    }, 
    startDates:[Date], 
    //SECRET TOUR - TO BE FETCHED BY PRE FIND M.W!
    secretTour: {
        type:Boolean, 
        default: false
    }

},
//MUST ADD THIS OPTIONS OBJECT TO THE SCHEMA - OTHERWISE V.P WILL NOT BE RETURNED IN THE OUTPUT!!
{
    //EACH TIME THE DATA IS OUTPUT  AS JSON - I WANT THE VIRTUAL
    toJSON: {virtuals:true}, 
    toObject:{virtuals:true}

}

)



//VIRTUAL PROPERTIES(not persisted!): Convert #days in db to #weeks in the output!
//get => Will be called each time something returned from db(getter)
//REGULAR FUNCTION - NOT ARROW - SINCE THE FUNCTION IS AN INSTANCE METHOD ON THE DOC OBJECT
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7; 
})


//IMPORTANT: I MUST HAVE THE slug PROPERTY ON THE SCHEMA DEFINED! OTHERWISE - this.slug = value - WILL NOT BE PERSISTED TO DB! 

//PRE SAVE DOCUMENT M.W : cb  m.w execute  ONLY between calling .save() and .create()
// [NOT ON insertMany] OR findByIdAndUpdate, findOneAndUpdate() ! SINCE THEY RETURNS QUERY
//this is the currently processed doc
// console.log('-----INSIDE PRE SAVE M.W----')
// console.log(this);- CURRENT DOCUMENT
//CHECK WHY PRINT ALSO THE V.P??
tourSchema.pre('save', function(next){

    this.slug = slugify(this.name, {lower: true})

    next();
})


//PRE-FIND QUERY M.W 
//THIS M.W WILL BE EXECUTED RIGHT BEFORE THE API Features :  await Tour.find({}..)
//this -> current processing Query instance
//=> THIS IS THE TIME TO CHAIN LOGIC TO THE BASIC LOGIC
tourSchema.pre(/^find/, async function(next) {
   
   
    const notSecretTours =  this.find({secretTour: {$ne : true}})

  
    //ADD TO THE current Query object a property (in ms)
    this.start = Date.now(); 


    next();
    

})


//POST FIND M.W 
tourSchema.post(/^find/, function(docs, next) {

    console.log(`Query took:   ${Date.now() - this.start} ms`)

    next();
})

const Tour = mongoose.model('Tour' , tourSchema)



//TESTS PRE M.W AND POST M.W
// tourSchema.pre('save', function(next){
//     console.log('IN THE SECOND(LAST) PRE SAVE M.W - going to save')
//     next();
// })

// //POST SAVE M.W()  - doc is the final document - 
// tourSchema.post('save', function(doc, next){


//     next();
// })


module.exports = Tour; 


/**SUMMARY - TOURS MODELLING
 * 
 * KEY NOTES: 
 *  1)The ratingsAverage & ratingsQuantity - ARE NOT REQUIRED ! 
 *      SINCE THEIR VALUES ARE NOT SET BY THE USER THAT CREATED THE TOUR 
 *      BUT ARE DERIVED BASED ON THE LATER WILL BE ADDED Review Model!
 * 
 *  2.IF SOME TOUR DATA IS NOT ON THE OVERVIEW PAGE OF THE WEBSITE - IT IS NOT REQUIRED!
 *      THE OVERVIEW PAGE: 
 *           Presents 3 cards of tours- each contains tour data:
 *           name,Difficulty duration, summary(prefix..), start location,amount of locations ,
 *           start date, Max group size , price , ratingAverage
 *           ratingQuantity , image 
 *       
 * 
 *  3.trim data property (only on string s) 
 * 
 *  4.imageCover - the image name as it is stored in the F.S
 *    image not stored in the DB! the db stores only the image name
 * 
 *  5.images:(other than the coverImage) - stored in an array !!
 *      type:[String]
 *  
 *  6.createdAt: timestamp(m.s) when the user creates the tour!
 *       => SHOULD SET TO TYPE OF DATE(JS DATA TYPE - SO I CAN USE IT) - AND BE ADDED AUTOMATICALLY: 
 *        Mongoose converts timestamp automatically to current date 
 *          type:Date , 
 *          default: Date.now(); 
 *              
 * 
 *  7.startDates: [Date] - each tour can starts at different dates ! 
 *     Different instances of the same tour document can starts at different date
 *           mongodb will parse the Date string in the format  I pass to it : 
 *                  like 2021-03-21,11:32, or timestamp ,,
 *                  to a JS Date object 
 *            If it can not parse - then throw an error!
 * 
 * 
 * 
 * 
 * 
 * ALL PROPERTIES( FOR NOW -BEFORE ADDING CUSTOM VALIDATORS...)
 * - name: String, required, unique
 * - price:Number ,required 
 * - Difficulty: String  , required
 * 
 * - ratingsQuantity  and ratingsAverage
 *       - Number
 *       - NOT REQUIRED: 
 *            since they are not create by the user that create the tour 
 *            they are derived calculations
 * 
 *      
 *   
 * 
 * 
 * 
 * 
 */