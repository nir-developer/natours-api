const {isEmail} = require('validator')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type:String, 
        required:[true, "Please tell us your name"]
    }, 
    email:{
        type:String, 
        required:[true, 'Please provide your email'], 
        unique:true, 
        lowercase:true, 
        validate:[isEmail,'Please provide a valid email']
    },
    photo:String, 

    password:{
        type:String, 
        required:[true, 'Please provide a password'], 
        minlength:8, 
        //FOR SECURITY - PREVENT DISPLAYING THE PASSWORD IN ANY OUTPUT OF THE USERS FROM THE DB  
        select:false
     },

     passwordConfirm:{
        type:String,
        required:[true, 'Please confirm your password'],
        validate:{
            //CUSTOM VALIDATOR:
            // ONLY WORKS ON SAVE OR CREATE(by default) 
            //el refers to the provided input for passwordConfirm ,this refers to the current Document instance
            validator: function(el){
                return el === this.password
            },
            message:'Password are not the same'
        }
     }
 

})


const User = mongoose.model('User', userSchema)

module.exports = User;