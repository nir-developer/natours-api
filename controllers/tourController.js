const { query } = require('express')
const Tour = require('../models/Tour')




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


exports.getAllTours = async (req,res,next)=>{

    try 
    {
        
        //FEATURE 1.A) Filtering
        ///BUILD THE QUERY(before executing it)
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])
        
        console.log(req.query,  queryObj);


        const {difficulty, duration} = queryObj;

        //FEATURE 1.B : ADVANCED FILTERING - QUERY OPERATORS : replace for ALL EXACT MATCHES OF  gt,lt,lte,gte
        let queryStr = JSON.stringify(queryObj)

        queryStr =queryStr.replace(/\b(lte|lt|gte|gt)\b/g,match => `$${match}`)
        //Query Object: { duration: { gte: '5' } } { duration: { gte: '5' } }
        // => OK Filter Object{ duration: { '$gte': '5' } } - this is the Filter Object  I want to pass to Mongoose query!
        //console.log(JSON.parse(queryStr))

        
        ///Returns a Query - and store the query - dont await it! just store it - only as the last step await it to execute the query 
         let query = Tour.find(JSON.parse(queryStr))
        ///FEATURE 2: SORTING
        if(req.query.sort) 
        {   //SORT BY 2 CRITERIA :http://localhost:3000/natours/api/v1/tours?sort=price ratingsAverage
            //SEPARATE THE QUERY STRINGS BY COMMA -> SPLIT: to get AN ARRAY OF ALL FIELDS NAME IN THE URL - AND THEN JOING THEM TOGETHER TO ONE STRING
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy)
            //FOR THE URL : http://localhost:3000/natours/api/v1/tours?sort=price
            //=>MONGOOSE WILL SORT the result based on the price field
            query = query.sort(sortBy)
        }
        else 
        {
            //DEFAULT SORTING : by createdAt Descending order:  NEWEST TOURS ARE DISPLAYED FIRST SINCE THEY HAVE LARGER TIMESTAMP!!
            query = query.sort('-createdAt'); 
        }


       


        
        //EXECUTE THE QUERY
        const tours = await query 

        


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
        res.status(400).json({
            status:'fail',
             message:err.message
            })
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