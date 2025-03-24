const User=require('../models/User');
const mailSender=require('../utils/mailSender');
const bcrypt=require('bcrypt');
const crypto=require('crypto');

// resetPasswordToken :  the mailsending or token sending related thing is done by this fxn 
exports.resetPasswordToken=async(req,res,next)=>{  //by using this token i want to update the user entry
    try{
        // get email from req body
        const {email}=req.body;
        // check user for this email,email validation
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Your email is not registered with us "
            })
        }
        // generate token
        const token=crypto.randomUUID(); //it generates a string containing a randomly generated,36 character long v4 UUID
        // update user by adding token and expiration time 
        const updatedDetails=await User.findOneAndUpdate({email:email},
            {
                token:token,
                resetPasswordExpires:Date.now()+5*60*1000,
            },
            {new :true}
            );
        // create url 
        const url=`http://localhost:3000/update-password/${token}`;  // this is a frontend url and frontend puts the token into the body
        // send mail containing the url
        await mailSender(email,
            "Password Reset Link",//subject
            `Password Reset Link : ${url}` //url that is to be send on the mail
            )

        // return response
        return res.json({
            success:true,
            message: "Email Sent Successfully,please check email and change password"
        })
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset password"
        })
    }
}



// resetPassword: the exact password that will be updated in DB will be done by this  fxn

exports.resetPassword=async(req,res)=>{
    try{
        // data fetch 
        const {password,confirmPassword,token}=req.body; //but token is present in frontend url so frontend puts the token into the request body i.e listed in above line 28

        // validation
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password is not matching",
            })
        }

        // get userdetails from db using token bcz we have to update the new pwd into user
        const userDetails=await User.findOne({token:token});
        // if no entry - invalid token 
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"Token is Invalid"
            });
        }
        // 2nd case of invalidity -token time check (expiration time)
        // if time exceeds from resetPasswordExpires then it is invalid token 

        // i have given the token time validity - 5 mins so after 5 mins the token will be expired 
        // 5pm - 5:05pm valid but now time is 6pm 
        // so 5:05<6:00 pm so expires  

        if(userDetails.resetPasswordExpires<Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token is expired, please regenerate your token",
            })
        }

        // hash password 
        let hashedPassword=await bcrypt.hash(password,10);
        // update the password 
        await User.findOneAndUpdate(
            {token:token},  //acc. to this parameter search
            {password:hashedPassword},  //this will be updated
            {new:true}  //give the updated document
        )
        // return response 
        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        });
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset password"
        })
    }
}

