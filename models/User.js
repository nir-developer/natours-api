const {isEmail} = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


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


//PRE-SAVE M.W: PASSWORD MANAGEMENT STEP 2:(HASH THE PASSWORD BEFORE SAVING USER)
//   Verify the password has changed since db saved/saved to/from db
//  and also remove the password confirmation 
userSchema.pre('save',async function(next){
  
    if(!this.isModified('password') ) return next();

    //Update the password to the hash value
    this.password =  await bcrypt.hash(this.password, 12);

    //PREVENT THE CONFIRM PASSWORD FROM BEING SAVED TO DB(OK DOES NOT IN THE DB AND NOT IN THE DB)
    this.passwordConfirm = undefined;

    //WILL SAVE THE USER
    next();
    

})


//INSTANCE METHOD  - OK !
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword)
}


//STATIC METHOD - OK
// userSchema.statics.verifyPassword = async  (candidatePassword, userPassword) =>{
//     console.log('INSIDE STATIC')
//     return await bcrypt.compare(candidatePassword, userPassword);
// }
const User = mongoose.model('User', userSchema)

module.exports = User;