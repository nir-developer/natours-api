const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const app = express();   
if(process.env.NODE_ENV==='development' || process.env.NODE_ENV==='test') 
    app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
//CHECK MULTER!!!!

//TEST FIRST GENERAL EXPRESS M.W
app.use((req,res,next) =>{
    req.requestTime = new Date().toISOString(); 
    //console.log(req.headers)

    next();
})




//END POINTS 
app.use('/natours/api/v1/tours', tourRouter)

app.use('/natours/api/v1/users', userRouter)


app.get('/natours/api/v1/', (req,res,next) =>{
    
    // res.status(200).json({'Time on the server': new Date()})
})


//OK
app.use('*', (req,res,next) => {
   next (new AppError((`Can't find ${req.originalUrl} on this server`, 404)))
  
})


//PASS EXPRESS THE ERROR HANDLER FUNCTION : IN THE FORM OF 4 params! 
app.use(globalErrorHandler)


module.exports = app; 




//app.use('*', (req,res,next) => {
    //INSTEAD OF RETURN THE RESPONSE - CREATE AN ERROR AND PASS TO NEXT!AS BELOW
    // res.status(404).json({
    //     message:'Page not found',
    //     status:'fail'
    // })


    //- BETTER :GENERATE THE ERROR AND PASS DOWN TO NEXT
    // const err = new Error(`Can't find ${req.originalUrl} on this server`); 
    // err.statusCode =404; 
    // err.status = 'fail'

    // next(err)

//     next (new AppError((`Can't find ${req.originalUrl} on this server`, 400)))
  
// })


//GLOBAL ERROR HANDLER OF EXPRESS!
// app.use((err,req,res,next) =>{
//     console.log(err.__proto__);

//     const status = err.status || 'error';
//     const statusCode = err.statusCode || 500; 
//     const message = err.message || 'Internal Server Error';

//     res.status(statusCode).json({
//         status:status,
//         message

//     })
// })
