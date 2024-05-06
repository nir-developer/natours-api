const {isEmail} = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
//crypto:built in node - for generating less strong hash - 
const crypto = require('crypto')

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
    role:{
        type:String, 
        //ENUM VALIDATOR
        enum:['user', 'guide', 'lead-guid', 'admin'], 
        default:'user'
    },
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
     }, 
     //FOR STEP 4 IN THE IMPLEMENTAION OF PROTECTED ROUTES(FOR CHECKING IF JWT ISSUED BEFORE/AFTER PASSWORD UPDATED)
     passwordChangedAt: Date, 

     //2 fields for password reset functionality
     passwordResetToken:String  ,
     passwordResetExpires:Date
})



////////////////////////////////////////////////////////////////////
//PRE-SAVE M.W-S
//////////////////////////////////////////////////////////

//PASSWORD MANAGEMENT STEP 2:(HASH THE PASSWORD BEFORE SAVING USER)
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


//USED IN FORGOT-RESET  PASSWORD  FUNCTIONALITY
userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    //MUST MAKE SURE TIME(JWT ISSUING) > TIME(UPDATE USER DOCUMENT)
    //OTHERWISE - USER WILL NOT BE ABLE TO USE THE NEW TOKEN(STEP 4 IN PROTECT M.W!!)
    //SOLUTION - 'HACK' - substruct 1 sec 
    this.passwordChangedAt = Date.now() - 1000; 



    next();
    
})


/////////////////////////////////////////////
//INSTANCE METHODS 
///////////////////////////////////
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword)
}


//INSTANCE METHOD - TO BE USED IN THE LAST STEP(STEP 4) OF PROTECTING ROUTES -  THE PROTECT FUNCTION 
//year-month-day 
userSchema.methods.changedPasswordAfter = function(JWTTimestamp)
{

    if(this.passwordChangedAt)
    {
        const changedTimestamp = Number.parseInt(this.passwordChangedAt  / 1000);

        console.log(changedTimestamp, JWTTimestamp)
        console.log(`PASSWORD CHANGED AFTER JWT ISSUED? ${changedTimestamp > JWTTimestamp}`)
        return changedTimestamp > JWTTimestamp;

    }

    //THE NORMAL CASE(MOST USERS NEVER CHANGE THEIR PASSWORDS...)
    return false;
}



userSchema.methods.createPasswordResetToken = function()
{
    //CREATE THE PASSWORD(plain text password)
    const resetToken = crypto.randomBytes(32).toString('hex'); 

    //CREATE THE HASH OF THE RESET PASSWORD - AND UPDATE THE CURRENT DOC INSTANCE 
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

        console.log(`plain text token reset: ${resetToken}`)
        console.log(`hashed reset token(stored in db):${this.passwordResetToken}`)    
    //UPDATE THE INSTANCE - IT WILL NOT UPDATE THE DOC IN THE DB!I NEED TO SAVE(in the controller) 
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

    //Return the plain text reset token!
    return resetToken;

}


const User = mongoose.model('User', userSchema)

module.exports = User;




//STATIC METHOD - OK
// userSchema.statics.verifyPassword = async  (candidatePassword, userPassword) =>{
//     console.log('INSIDE STATIC')
//     return await bcrypt.compare(candidatePassword, userPassword);
// }