const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const mongoose = require('mongoose')
const app = require('./app')




//SELECT ENVIRONMENT VARIABLE!!
const setEnvironment = (environmentName = 'development') =>{
    if(environmentName !== 'development' && environmentName !== 'test' && environmentName !== 'production') throw new Error('Invalid Environment Name')
   
    if(environmentName === 'test')
        process.env.NODE_ENV = 'test'
     
     else if(environmentName === 'development')
        process.env.NODE_ENV ='development' 
    else if(environmentName === 'production')
        process.env.NODE_ENV = 'production'
   
}

const setDatabase = () =>{
    const environment = process.env.NODE_ENV; 
    if(!environment) throw new Error(`Can not set database - NO ENVIRONMENT WITH THE NAME ${environment}`)

    if(environment === 'test' ) process.env.DB = process.env.DB_COMPASS; 
    else if(environment === 'development') process.env.DB =process.env.DB_ATLAS;
}


// setEnvironment()
// setDatabase();


const PORT = process.env.PORT || 3000; 
// const DB = process.env.DB;
const DB = process.env.DB_COMPASS;



mongoose.connect(DB) 
.then(()=> {
    console.log(`CONNECTING TO DB: ${DB}`)
    app.listen(PORT, () => console.log(`Natours API listening on port  ${PORT} in ${process.env.NODE_ENV} mode`))

})
.catch(err => {
    console.log(`FAILED TO CONNECT TO DB: ${DB}`)
})







