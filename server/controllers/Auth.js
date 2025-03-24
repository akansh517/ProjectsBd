const User=require('../models/User');
const OTP=require('../models/OTP');
const otpGenerator = require('otp-generator');
const Profile = require('../models/Profile');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv').config();


// sendotp will be done before the signup 

exports.sendOTP=async(req,res)=>{
    try{
        // fetch email from req body 
        const {email}=req.body;

        // check if user already exists 
        const checkUserPresent=await User.findOne({email});
        // if user already exist,then return a response 
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered",
            })
        }
        // generate OTP                length,{inside the object i have define the options that the otp consists of}
        let otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })

        console.log("OTP generated",otp);

        // after the generation of OTP i have to make sure that the generated otp is unique 
        // check unique otp or not 

        // Brute force for checking the uniqueness of OTP - This is not a good code approach bcz we are checking repeatedly into the database that the otp is unique or not but in production grid we will use a library that will always generate a unique otp 

        const result=await OTP.findOne({otp:otp});

        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result=await OTP.findOne({otp:otp});
        }

        // creating otp object 
        const otpPayload={email,otp};
        // create an entry for OTP into db
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successful
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }
    catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:error.message
        })
    }
}


// signup

exports.signup=async(req,res)=>{
    try{

    
        // fetch data from req body 
        const{firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp}=req.body;

        // Do Validate that all the fields are non empty

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        // There are 2 passwords confirm and simple match them 

        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword value do not match,please try again"
            })
        }
        // check user already exists or not 

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered"
            })
        }

        // find most recent otp stored for the user (email) by using the sort query that is written below
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        
        // validate the otp 
        if(recentOtp.length==0){
            // OTP not found 
            return res.status(400).json({
                success:false,
                message:"OTP Not found"
            })
        }
        // OTP not match or Invalid OTP
        else if(otp!==recentOtp.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP or OTP not match"
            })
        }


        // hash password 
        const hashedPassword=bcrypt.hash(password,10);

        // entry created into db  

        // inside the additionalDetails we will put Profile model object id so we have to create a profile and if i want object id then first i have to save into the db

        const profileDetails=await Profile.create({
            gender:null,
            dataOfBirth:null,
            about:null,
            contactNumber:null
        });

        // we have to put a img so if i want to put a image then i will use one third party service named Dicebeer in which there is an api .Lets suppose my name is Akansh Jain then it will create an img named aj with the help of api through which i can use as a profile picture which will generate an img with the help of firstname and lastname 

        const user=await User.create({
            firstName,
            lastName,email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,//create a profile picture on te basis of firstname and lastname with the help of dicebear api on the profile picture by default
        })
        // return response

        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered.Please try again"
        })

    }

}


// login

exports.login=async(req,res)=>{
    try{
        // get data from req body 
        const {email,password}=req.body;
        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }
        // user check exist or not 
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            })
        }
        // generate jwt, after password matching 
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }

            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            });
            user.token=token;
            user.password=undefined;

            // create cookie and send response

            const options={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in Successfully"
            })
        }
        else{
            res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })
        }     
    }
    
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure,please try again"
        })
    }
};


// changepassword
// TODO :HOmework

exports.changePassword=async(req,res)=>{
    //get data from req body
    // get oldPassword,newPassword,confirmNewPassword
    // Validation
    // update pwd in DB
    // send mail-password updated
    // return response


}
