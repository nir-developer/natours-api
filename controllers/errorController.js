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
    else if(process.env.NODE_ENV=== 'production')
    {
        //EXTRACT THIS CODE TO sendErrorProd
        sendErrorProd(err,res)



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