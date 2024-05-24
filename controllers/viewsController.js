
const catchAsync = require('../utils/catchAsync')

const appError = require('../utils/appError')


exports.getOverview = catchAsync(async(req,res,next) =>{
    console.log('getOverview Called!')
    res.status(200).render('overview', {
        title: 'XXX'
    })

})

exports.getTour = catchAsync( async(req,res,next)=>{
    console.log('getTour View')
    res.status(200).render('tour', {
        title:'Exciting tours for adventurous people'

    })
    
})