const Tour = require('../models/Tour')
const APIFeatures = require('../utils/apiFeatures')



////////////////////////////////////////////////////////////////////////////////////
//ROUTE ALIAS - POPULAR ROUTE - NOT PART OF THE API FEATURES(below)
//STEP 1: TEST THE NON FRIENDLY URL FIRST: http://localhost:3000/natours/api/v1/tours?limit=5&sort=-ratingsAverage,price
//STEP 2: BASED ON THIS URL - USE M.W TO PRE-POPULATE THE SEARCH QUERY VALUES (req.query ..)
//STEP 3: CREATE A NEW GET ROUTE BY ADDING THE M.W BEFORE THE getAllTours() handler: 
//      tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)
//STEP 4: TEST POSTMAN: http://localhost:3000/natours/api/v1/tours/top-5-cheap

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


/**Reusable class contains all API FEATURES - to be used by all resources
 * THIS CAN BE DONE BY INJECTING THE Mongoose.Query object in the constructor class 
 * instead of quering for the Tour inside the class - and therefore bound it to the Tour resource
//NOTE: 
//query is Mongoose Query object, 
//queryString : req.query object from express
 */
// class APIFeatures{
//     constructor(query, queryString)
//     {
//         this.query = query ; 
//         this.queryString = queryString;
//     }
    
//     //API-FEATURE 1: FILTERING 
//     //FEATURE 1.A) Filtering
//     //BEFORE REFACTORING TO THIS CLASS
//      //let query = this.query.find(JSON.parse(queryStr))
//     filter()
//     {
        
//         const queryObj = {...this.queryString};
//         const excludedFields = ['page', 'sort', 'limit', 'fields']
       
//         excludedFields.forEach(el => delete queryObj[el])
        
//        // console.log(this.query,  queryObj);


//         //FEATURE 1.B : ADVANCED FILTERING - QUERY OPERATORS : replace for ALL EXACT MATCHES OF  gt,lt,lte,gte
//         let queryStr = JSON.stringify(queryObj)
//         queryStr =queryStr.replace(/\b(lte|lt|gte|gt)\b/g,match => `$${match}`)
        

//         //UPDATE THE query instance property to the query parameter
//         this.query = this.query.find(JSON.parse(queryStr))

//         return this;
//     }
       

//     //2)SORT
//     sort()
//     {
//         // if(req.query.sort) 
//         if(this.queryString.sort) 
//         {   
           
//             const sortBy = this.queryString.sort.split(',').join(' ');
//             // console.log(sortBy)

//             this.query = this.query.sort(sortBy);
//             //query = query.sort(sortBy)
//         }
//         else 
//         {
//             //DEFAULT SORTING : by createdAt Descending order:  NEWEST TOURS ARE DISPLAYED FIRST SINCE THEY HAVE LARGER TIMESTAMP!!
//             this.query = this.query.sort('-createdAt'); 
//         }

//         return this;

//     }

//     //3) LIMITING FIELDS
//     limitFields() 
//     {
//          //FEATURE 3:FIELD LIMITING
//        if(this.query.fields)
//        {    
//         //Create an array of strings from the query req.query.fieldss
//         const fields = this.query.fields.split(',').join(' ')

//         //MONGOOSE EXPECTS FIELDS SEPARATED BY SPACES 
//         this.query = this.query.select(fields) 
//        }
//        else
//        {
       
//          this.query.select('-__v')
//        }

//        return this;

//     }

//     //4)PAGINATION
//     paginate()
//     {
      
//        const page = this.queryString.page * 1 || 1 
//        const limit = this.queryString.limit * 1 || 100
//        const skip = (page - 1)  * limit; 

//        this.query = this.query.skip(skip).limit(limit);
  
//        return this;

      
//      //DONT NEED ALL THE BELOW CODE!! SINCE I DONT NEED TO THROW AN ERROR WHEN NO RESULTS!! client understand that [] ...
//        //COMPUTE THE SKIP VALUE - NUMBER OF DOCUMENTS TO BE SKIP
//        //const skip = (page - 1) * limit;
//         //    if(this.queryString.page)
//         //    {
//         //      const numberOfTours = await Tour.countDocuments(); 

//         //     if(numberOfTours < skip) throw new Error(`This page does not exist`)

//         //    }
      
      
//        //TEST THE REQUEST FOR ONE PAGE WITH 3 RESULTS - OK!

//     }
    
// }






//AFTER REFACTORING TO THE APIFeatures THIS METHOD WILL BE MUCH CLEANER
//THIS METHOD JUST BUILD THE INSTANCE CONTAINS ALL THE API-FEATURES - BY CONSTRUCTING AN INSTANCE OF APIFeature using Builder 
exports.getAllTours = async (req,res,next)=>
{
    try 
    {
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .paginate();
       

    //NOTE: ALL THE CHAINS QUERY ARE STORED IN THE features.query
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
    catch(err)
    {
        res.status(404).json({
            status:'fail',
             message:err.message
            })
    }
}



exports.createTour = async (req,res,next) =>{
   try 
   {
       const tour = await Tour.create(req.body)

       res.status(201).json({
        status:'success', 
        data:{
            tour
        }
       })

   }
   catch(err)
   {
        res.status(400).json({status:'fail', message:'Invalid data sent!'})
   }
     
}


exports.findTour = async (req,res,next) =>{
    try 
    {
       //MONGOOSE:  Tour.findById(req.params.id): shorthand of Tour.findOne({_id: req.params.id})
        const tour = await Tour.findById(req.params.id) ;
        // let tour = new Tour({name:'x'})
        //  tour = await tour.save(tour);

        if(!tour) throw new Error(`tour with id ${req.params.id} not found`)

        res.status(200).json({
            status:'success', 
            data:{
                tour
            }
        })

    }
    catch(err)
    {
        res.status(404).json({
            status:'fail', 
            message:err.message
        
        })
    }
}

exports.updateTour = async (req,res,next) =>{

    try 
    {
       
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, 
            {
                new:true, 
                runValidators:true
            }) 

        
        //if(!tour) throw new Error()


        res.status(200).json({
            status:'success', 
            data:{
                tour
            }
        })
    }
    catch(err)
    {
        res.status(400).json({
            status:'fail', 
            message:err
        })
    }
}

exports.deleteTour = async (req,res,next) =>{
    try 
    {
        const id = await Tour.findByIdAndDelete(req.params.id)

        console.log('DELETED TOUR WITH ID: ', id)

        res.status(204).json({
            status:'success', 
            data:{
                id
            }
        })

    }
    catch(err)
    {
        res.status(400).json({
            status:'fail', 
            message:err
        })
    }
}



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