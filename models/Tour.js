const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name:{
        type:String, 
        required:[true, 'A tour must have a name'], 
        unique:true, 
        trim:true
    }, 
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
        default:Date.now()
    }, 
    startDates:[Date]


})


const Tour = mongoose.model('Tour' , tourSchema)

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