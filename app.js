const tourRouter = require('./routes/tourRoutes')

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const app = express();   
if(process.env.NODE_ENV==='development' || process.env.NODE_ENV==='test') 
    app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
//CHECK MULTER!!!!



//END POINTS 
app.use('/natours/api/v1/tours', tourRouter)


app.get('/natours/api/v1/test', (req,res,next) =>{
    res.status(200).json({message:'GET HOME - OK'})
})

























module.exports = app; 