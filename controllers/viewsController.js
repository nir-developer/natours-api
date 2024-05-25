const Tour = require('../models/Tour')
const catchAsync = require('../utils/catchAsync')

const appError = require('../utils/appError')


exports.getOverview = catchAsync(async(req,res,next) =>{

    //1) GET TOURS FROM DB
    const tours = await Tour.find(); 

    //2) Build the template 

    //3) Render this template using data from 1
    res.status(200).render('overview', {
        title: 'All Tours', 
        tours

    })

})

exports.getTour = catchAsync( async(req,res,next)=>{
    console.log('getTour View')
    res.status(200).render('tour', {
        title:'Exciting tours for adventurous people'

    })
    
})