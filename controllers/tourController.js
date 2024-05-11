const Tour = require('../models/Tour')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
// //CATCH ASYNC(ERROR HANDLING)
// //DO I HAVE TO PASS next to fn??
// const catchAsync = fn => (req,res,next) => fn(req,res,next).catch(next)


exports.deleteTour = factory.deleteOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.createTour = factory.createOne(Tour)

exports.aliasTopTours = (req,res,next) =>{


    //SET TO STRING !
    req.query.limit = '5'
    req.query.sort = '-averageRatings,price' 
    //IMPORTANT - POPULATE SOME  FIELDS - SO IN THE NEXT M.W(findAllTours) WILL USE THE LIMING FIELDS(PROJECTION) 
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'

    console.log('aliasTopTours:')
    console.log(req.query)
    next(); 
    
}

//AFTER REFACTORING TO THE APIFeatures THIS METHOD WILL BE MUCH CLEANER
//THIS METHOD JUST BUILD THE INSTANCE CONTAINS ALL THE API-FEATURES - BY CONSTRUCTING AN INSTANCE OF APIFeature using Builder 
//NO ERROR SHOULD BE THROWN FOR NO RESULTS!
//NAM RETURNS 204 FOR EMPTY RESULTS JONAS RETURNS 200
exports.getAllTours =  catchAsync(async (req,res,next)=>
{
 
    console.log('GET ALL TOURS - EXPECT TO GET SKY BLUE COOKIE SET ON THE FIRST M.W!')
    console.log(req.cookies)
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .paginate();
       

    //NOTE: ALL THE CHAINS QUERY ARE STORED IN THE features.query
    //IMPORTANT !! IF THERE ARE PRE-FIND M.W - THEY WILL BE EXECUTED NOW!! BEFORE THE AWAIT (EXECUTING THE QUERY
    const tours = await features.query;

    
        //SEND RESPONSE
        res.status(200).json({
            status:'success', 
            results: tours.length, 
            data:{
                tours
            }
        })
    
}

)

// exports.createTour = catchAsync(async (req,res,next) =>{

//     console.log('INSIDE createTour - id guides array ')
//     console.log(req.body.guides)
//      const newTour = await Tour.create(req.body); 

//      res.status(201).json({
//         status:'success',
//         data:{
//             tour:newTour
//         }
          
//      })
// })


//IMPORTANT - JONAS WRONG -I UPDATED THE BELOW CODE OF JONAS (Q.A) - ADDED POPULATE - IN LECTURE 157 -Virtual  Populate the tours - to get revies
 // const tour = await Tour.findById(req.params.id)
exports.findTour = catchAsync(async (req,res,next) =>{
    
    //MONGOOSE:  Tour.findById(req.params.id): shorthand of Tour.findOne({_id: req.params.id})
    //POPULATE THE TOUR WITH THE REFERENCED USERS - AND FILTER OUT THE  USER FIELD NAMES: FORM THE RESULT SET
       const tour = await Tour.findById(req.params.id).populate('reviews');
        if(!tour) 
        return next( new AppError('No tour found with that ID', 404))
    
    
    res.status(200).json({
        status:'success', 
        data:{
            tour
        }
    })


    //if(!tour) throw new Error(`tour with id ${req.params.id} not found`)
    //USE MY CUSTOMER ERROR CLASS - AND PASS TO EXPRESS M.W TO RETURN THE ERROR RESPONSE

  
})



//BEFORE REFACTORING THE FACTORY - updateOne!!
// exports.updateTour = catchAsync( async (req,res,next) =>{
    
//     //const tour = await Tour.findById(req.params.id)
//     const tour  = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new:true, 
//         runValidators:true
//     })


//     if(!tour) 
//         return next( new AppError('No tour found with that ID', 404))
    
//     res.status(200).json({
//     status:'success', 
//         data:{
//             tour
//         }
//     })
    
    
      
//             //WILL NOT TRIGGER THE PRE-SAVE M.W!(only .save() and .create() !)
//             // const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, 
//             //     {
//             //         new:true, 
//             //         runValidators:true
//             //     }) 
//         //MONGO DB SYNTAX
//         //Tour.findOne({_id:" req.params.id}"})
        
//         //NOTE HERE!! ERROR HANDLING!
//         //if(!tour) throw new Error()

   
// })

//NOTE - THE BELOW  FUNCTION IS CALLED IMMEDIATLY - TOP LEVEL CODE : The return function is stored in the deleteOne function(variable) 
//UNTIL A REQUEST IS COMING - AND THEN EXPRESS WILL CALL THE CREATED FUNCTION RETURNED BY THE FACTORY!




//BEFORE REFACTORING THE FACTORY METHOD REFACTORING TO 
// exports.deleteTour =  catchAsync(async(req,res,next) =>{

//    const tour =  await Tour.findByIdAndDelete(req.params.id)

//    if(!tour) 
//     return next( new AppError('No tour found with that ID', 404))


//     res.status(204).json({
//         status:'success', 
//     })
// })



//AGGREGATION PIPELINE IMPLEMENTATION USING MONGOOSE
exports.getTourStats =catchAsync( async(req,res,next) =>{


        //Tour.aggregate returns a Promise<Aggregation> -I need to await it
        const stats = await Tour.aggregate(

            [
                //1)MATCH STAGE: (like filter object in mongo db) 
                {
                    $match:
                    { 
                        ratingsAverage: {'$gte': 4.5}
                    }
                }, 
                //2)GROUP STAGE:
                //STEP 1:specify the field id to group by (set to null if I want to group on all docs)
                {
                    //TEST : GROUP NON ON A SPECIF FILED 
                    //_id: null
                    
                    $group:
                    {
                        //GROUP ON THE DIFFICULTY - TO LISTS OF DOCS CATEGORIZED BY DIFFICULTY: LIST OF EASY TOURS, MED TOURS
                        _id: {$toUpper: '$difficulty'}, 
                        //FOR EACH OF THE DOCS THAT GOES THROUGH THIS PIPE-LINE - ADD 1 to the sum
                        num: {$sum: 1},
                        //FOR EACH OF THE DOCS THAT GOES THROUGH THIS PIPE-LINE - ADD IT'S ratingsQuantity value to the sum
                        //=> DATA SCIENCE: THE MOST DIFFICU
                        numRatings: {$sum: 'ratingsQuantity' },
                        avgRating: { $avg: '$ratingsAverage'}, 
                        avgPrice: {$avg: '$price'}, 
                        minPrice: {$min: '$price'} ,
                        maxPrice: {$max: '$price'}, 

                    }
                }, 
                //SORT STAGE - sort by avgPrice - ascending (field of last resultset!)
                {
                    $sort: {avgPrice: 1}
                },
                //TEST : REPEAT STAGE: match - EXCLUDE ALL EASY TOURS
                // {
                //     $match:{ _id: {$ne: 'EASY'}}
                // }

            
            ]
        )

            res.status(200).json({
            status:'success', 
            data:{
                stats
            }
        })
})


exports.getMonthlyPlan = catchAsync(async (req,res,next) =>{

            //TRANSFORM TO NUMBER
            
            console.log(req.params.year);
            const year = req.params.year * 1;
            console.log(year)
            const plan = await Tour.aggregate(
            [
            //STAGE 1: UNWIND STAGE: EXTRACT ONE TOUR FOR EACH DATE IN THE startDates array input
            //TEST: OK one tour for each date - instead of a tour contains an array of dates!
            //STAGE: 2: MATCH: SELECT ALL TOURS WITH THE GIVEN YEAR QUERY SEARCH
            //FIND ALL TOURS WITH STARTS DATE d: 01.01.year < d < 01.01.year
             {
             $unwind: '$startDates'
             },
             {
                $match:
                {
                    startDates: 
                    {
                        $gte: new Date(`${year}-01-01`), 
                        $lte: new Date(`${year}-12-31`)
                    }
                }
             },
             //STAGE 2: STAGE GROUP STAGE:group by the month
             // $month(HOW TO EXTRACT THE MONTH FROM THE)
             //SOLUTION: MONGODB AGGRAGATION  PIPELINE OPERATORS(not stages) :
             //startDates is the field I want to extract the date from 
             //(using mongodb aggragatoin pipeline $month )
             //COUNT #tours starts on the same date(like with the difficulty before)
             
             {
                $group: {
                    _id:  { $month: '$startDates'}, 
                     numTourStarts: { $sum: 1} ,
                     //CREATE AN ARRAY TO GET ALSO THE TOUR ITSELF IN THE RESULT SET 
                     tours: {$push: '$name'}
                }
             }, 
             //STAGE 3: addFields: add the field 'month' with the _id value(1,2,3,,,12)
             {
                $addFields:{ month: '$_id'}
             },
             //STAGE 4: PROJECT STAGE - GET RID OF THE _id in the output
             {
                $project:{ 
                    _id: 0
                }
             }, 
             //STAGE 5: SORT STAGE - SORT BY #TOURS STARTS - DESCENDING
             {
                $sort: {numTourStarts: -1}
             }, 
             //STAGE 6: LIMIT STAGE(similar to the limit in the Query) - GET THE FIRST 6 DOCS!
             {
                $limit: 6
             }

         ]
         )

            res.status(200).json({
            status:'success', 
            data:{
                plan
            }
        })

    
    })


    // exports.getCookies = catchAsync(async (req,res,next)=>{

    //     const cookies = req.cookies;
    //     console.log(cookies); 

    //     res.status(200).json({
    //         status:'success', 
    //         cookies
    //     })
    // })

/**SUMMARY: IMPORTANT!!!!!!!!!!!!!!!!
 1) Error Handling
        CREATE THE TOUR DOCUMENT(MONGOOSE WILL VALIDATE THE REQUEST BODY BASED ON MY VALIDATION RULES
        AND THROW AN ERROR IF VALIDATION FAILED -  WITH ALL DETAILS OF WHICH FIELDS ARE NOT CORRECT etc...
            -  I DONT NEED TO VALIDATE THE REQUEST BODY IN THE CONTROLLER (AND THROW AN ERROR ETC..)!!
                I JUST NEED TO PASS THE REQ BODY TO MONGOOSE MODEL AND IT WILL VALIDATE AND THROW AN ERROR IF NOT VALID! 
            - THE CONTROLLER RESPONSIBILITY IS TO  HANDLE THE ERROR THROWN BY MONGOOSE (TRY-CATCH) ERROR HERE IN THE CONTROLLER 
       
            - IN THE CONTROLLER I NEED TO THINK WHEN AN ERROR MIGHT BE THROWN - AND I TO GIVE IT AN APPROPRATE STATUS
        -        EXAMPLE: WHEN CREATING AN ENTITY -  WHEN AN ERROR IS THROWN AFTER CALLING MONGOOSE WITH INVALID INPUTS OF THE REQ.BODY
                   I NEED TO SET THE STATUSCODE TO  400 
                   - I DEFINE THIS STATUS CODE HERE IN THE CONTROLLER
                    FOR NOW - SET THE MESSAGE TO THE err OBJECT THROWN BY MONGOOSE!
                    BUT FOR THE CLIENT - SEND THE message AS SIMPLE AND MEANINGFUL - Invalid Data Sent!
 
---------------------------------------------------
    2.Mongoose: 
-----------------------------------------------------
        2.1 Tour.findById(req.params.id) - shorthand of Tour.findOne({_id: req.params.id})
       
        2.2 Update a model  + eturn the updated entity + Running the validators! 
                 const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true}) 
                pass a third paramater - options object with the 2 properties
                            new:true to return the updated tour !
                            runValidators:true - run validators!


    IMPORTANT Model Prototype methods and not Prototype methods: 
        
            - Model Prototype method:  Model.prototype.save() :
                -> Any Model instance that created from the Model class constructor - has access to save() method!
                    
                         const newTour = new Tour({}); 
                         newTour.save() ; 

                -> The Model itself - has no access to this method: Tour.save() is not allowed
           

            - Not Model prototype method: findByIdAndUpdate : 
                   
                        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, 
                        {
                            new:true, 
                            runValidators:true
                        }) 
                            
                
               NOTE: RETURNS A QUERY (not a Document) AND IT IS A METHOD ON THE INSTANCE MODEL - NOT IT'S PROTOTYPE 
                     it updates only fields that have changed! 
                      //{new:true} - to return the updated tour !
                            //Returns a Quey ! not a Document -> the save() is not avaliable on tour instance of Document
                            //VERY IMPORTANT!!! ADD THE runValidators options! OTHERWISE MY MESSAGES 
                            //WILL NOT BE RETURNED - BUT THE RAW MESSAGE OF MONGOOSESINCE IT RUNS BY DEFAULT ONLY ON save() OR create!!!


                DELETE RESOURCE: res.json() - will not return a content- only status code 204!

 */

                ////////////////////////////////////////////////////////////////////////////////////
//ROUTE ALIAS - POPULAR ROUTE - NOT PART OF THE API FEATURES(below)
//STEP 1: TEST THE NON FRIENDLY URL FIRST: http://localhost:3000/natours/api/v1/tours?limit=5&sort=-ratingsAverage,price
//STEP 2: BASED ON THIS URL - USE M.W TO PRE-POPULATE THE SEARCH QUERY VALUES (req.query ..)
//STEP 3: CREATE A NEW GET ROUTE BY ADDING THE M.W BEFORE THE getAllTours() handler: 
//      tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)
//STEP 4: TEST POSTMAN: http://localhost:3000/natours/api/v1/tours/top-5-cheap
