const mongoose=require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    // Timestamp of otp-at what time i have created the otp 
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60 //after 5 mins otp will be expired
    }
})


// a function to send emails in which i have to pass the email to which i have to send the otp

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification Email from StudyNotion",otp);
        console.log("Email Sent Successfully", mailResponse);
    }
    // when we have to write production level code then we have to put some line so that some other will get to know that at which place the error has occured 
    catch(error){
        console.log("Error Occured while sending mail:",error);
        throw error;
    }
}

// before saving the document we will sendVerificationEmail with the email that is fetched from the body and after doin this we will go to the next middleware
// when we are using the pre middleware then we know that fxn has not been saved so that why we are not passind doc inside the fxn like post middleware or we can pass next inside the pre and it basically calls the next middleware

OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})


module.exports=mongoose.model("OTP",OTPSchema);