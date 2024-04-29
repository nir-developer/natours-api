module.exports = (err,req,res,next) =>{
    console.log(err.__proto__);

    const status = err.status || 'error';
    const statusCode = err.statusCode || 500; 
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status:status,
        message

    })
}