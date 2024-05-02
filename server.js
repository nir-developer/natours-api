const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`)
const mongoose = require('mongoose')
const app = require('./app')



//START LISTEN TO  UNCAUGHT EXCEPTIONS (SYNC CODE) RIGHT HERE ON THE TOP 
// to take effect for the rest of the app
//NOTE: the server paramter is not needed for handling SYNC errors(like with ASYNC CODE AS IN THE BOTTOM OF THE PAGE!
//THIS SYNC ERRORS WILL BE THROWN EVEN BEFORE MY APP STARTED(ASYNC..)
process.on('uncaughtException', err => {
     console.log('UNCAUGHT EXCEPTION! * HUTTING DOWN....')
     console.log(err)

     process.exit(1); 

    //TERMINATE GRACUFULLY 
    // server.close(() => {
     
    // }); 
    
})


// console.log(x)
//SELECT ENVIRONMENT VARIABLE!!




// setEnvironment()
// setDatabase();


const PORT = process.env.PORT || 3000; 
// const DB = process.env.DB;
const DB = process.env.DB_COMPASS;

const server = app.listen(PORT, () =>{ 
    console.log(`NATOURS API RUNS ON  http://localhost:${PORT}/natours/api/v1/`)
})


mongoose.connect(DB) 
.then(()=> {
    console.log(`CONNECTING TO DB: ${DB}`)
    //app.listen(PORT, () => console.log(`Natours API listening on port  ${PORT} in ${process.env.NODE_ENV} mode`))

})
//REMOVE THIS LOCAL PROMISE REJECTION HANDLING - LIVE IT TO THE GLOBAL BELOW
// .catch(err => {
//     console.log(`FAILED TO CONNECT TO DB: ${DB}`)
// })


//GLOBAL - HANDLING UNHANDLED REJECTIONS(Here the server is required - since I want to handle ASYNC ERRORS!)
process.on('unhandledRejection', err => {
    // console.log('UNHANDLED REJECTIONS! * HUTTING DOWN....')
    //  console.log(err)
     
    //SHUT DOWN THE APPLICATION - (GRACEFULLY) 
    //GRACEFULLY: (server.close()) : LET SERVER  FINISH HANDLING ALL PENDING REQUEST
    server.close(() => {
         console.log('UNHANDLED REJECTIONS! * HUTTING DOWN....')
        console.log(err)
     //SINCE NO DB CONNECTION 
        //NOTE: STATUS CODE 1: UNCAUGHT EXCEPTIONS!
        //SHUT DOWN THE SERVER ONLY NOW - AFTER GRACEFULLY CLOSE THE SERVER
        process.exit(1); 
    }); 
})






//MAKE NODE THROW AN EXCEPTION
// console.log(xx)








