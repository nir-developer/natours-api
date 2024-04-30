const AppError = require('../utils/appError')


//INVALID MONGODB ID(THROWN BY MONGOOSE!NOT DRIVER!)
//path: name of the input field with the invalid value
const handleCastErrorDB = err => {

    //CONSTRUCT A MESSAGE BASED ON THE PATH AND VALUE IN THE ERROR MONGO THROW
    const message = `Invalid ${err.path}: ${err.value}`

    return  new AppError(message, 400)
}



//DUPLICATE FILED (THROWN BY MONGODB DRIVER! NOT MONGOOSE)
//THE MESSAGE MONGODB DRIVER RETURNS: 
// "message": "E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: \"The Snow Adventurer\" }",
//EXTRACT THE FIELD VALUE FROM THE MESSAGE  BY REG EX!
const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0]
  console.log(value)

  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}



const handleValidationErrorDB = err => {

    //EXTRACT AN ARRAY OF ALL VALUES : LOOP OVER THE err.errors  OBJECT  CREATED BY MONGOOSE 
    //PROPERTIES(elements) AND TAKE THE VALUES
    const errors = Object.values(err.errors).map(el => el.message)

    
    //errors is an array of strings 
    const message = errors.join('. ')
    


    return new AppError(message, 400)
}



//DEV: I DONT DISTINGUISH BETWEEN OPERATIONAL AND PROGRAMMING - THIS IS FORM ME! 
//( I WANT SEE ALL DETAILS IN BOTH 2 ENVIRONMENTS)
const sendErrorDev = (err,res) =>{
   
    res.status(err.statusCode).json({
        status: err.status,
        message:err.message, 
        //ADD MORE DETAILS - THIS IS FOR ME!
        error:err,
        stack:err.stack
      })
}

//IMPORTANT - HERE IN PRODUCTION:  NEED TO DISTINGUISH BETWEEN OPERATIONAL AND PROGRAMMING ERRORS
const sendErrorProd = (err,res) =>{  
    //OPERATIONAL ERRORS THAT I TRUST(Send  a list of my marked errors - that I trust!
    if(err.isOperational) 
    {
       
        res.status(err.statusCode).json({
             status:err.status,
             message:err.message
        })

    }
    //PROGRAMMING OR OTHER UNKNOWN ERROR - DONT LEAK ERROR DETAILS
    else{
     //1)LOG THE ERROR GO CONSOLE - THIS IS FOR ME - THE API DEV - 
    console.error(`ERROR ** `, err)

    //2)SEND A GENERIC SHORT MESSAGE TO THE CLIENT
    res.status(500).json({
        status:'error', 
         message:'Something went very wrong'
        })
    }

}

module.exports = (err,req,res,next) =>{

   //BUILD/UPDATE THE err parameter 
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error'


    if(process.env.NODE_ENV === 'development')
    {
        sendErrorDev(err, res);
        //EXTRACT THIS CODE to sendErrorDev
        // res.status(err.statusCode).json({
        // status: err.status,
        // error:err,
        // message:err.message, 
        // stack:err.stack
     // })
    }
    //MORE IMPORTANT (complex)
    //SUPER IMPORTANT!!
           //let error = {...err};
           //MUST ADD THE name and message property - since they are not on the copy object !!!
          /** COPY OBJECT RETURNED BY DESTRUCTURING - DOES NOT PRESERVE SOME PROPERTIES OF ORIGINAL ONE!!
           * let error = { ...err };
            console.log(`error.code of copy object = ${error.code}`)
           console.log(`error.name of copy object = ${error.name}`)
            console.log(`error.message of copy object = ${error.message}`)
           * error.code of copy object = 11000
            error.name of copy object = undefined
            error.message of copy object = undefined
           */

    else if(process.env.NODE_ENV=== 'production')
    {
     
         //WRONG WAY READ ABOVE!!  :JONAS 
         //let error = {...err}

          //CORRECT WAY!! 
          let error = {...err, name:err.name, message:err.message, errors:err.errors}
            
          
          if(error.name === 'CastError') error = handleCastErrorDB(error); 
          
           //duplicate error is thrown by MongodDriver(not by Mongoose )-> it does not have the error.name 
          if(error.code === 11000) error = handleDuplicateFieldsDB(error)

          //Handle Mongoose Validation Errors(Mongoose put them in an array!(spring like..))
          if(error.name === 'ValidationError') error = handleValidationErrorDB(error)


        
        sendErrorProd(error,res)
        
        
        
        //EXTRACT THIS CODE TO sendErrorProd
        // res.status(err.statusCode).json({
        //     status:err.status,
        //     message:err.message
        // })
    }

    //BEFORE SPLITTING TO DEV AND PROD - I SENT SAME ERROR RESPONSE TO ANYONE(TO ME AND CLIENTS- BAD)

    //EXTRACT THIS CODE TO the sendErrorProd/Dev
    // res.status(statusCode).json({
    //     status:status,
    //     message

    // })
}