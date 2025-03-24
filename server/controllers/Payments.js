const {instance}=require('../config/razorpay');
const Course=require('../models/Course');
const User=require('../models/User');
const mailSender=require('../utils/mailSender');
const {courseEnrollmentEmail}=require('../mails/templates/courseEnrollmentEmail');
const mongoose= require('mongoose');



// capture the payment and initiate the Razorpay order 
exports.capturePayment=async(req,res)=>{
    
    // get courseId and UserID 
    const {course_id}=req.body;
    const userId=req.user.id;
    // validation 
    // valid courseID 
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid course Id"
        })
    }
    // valid courseDetail 
    let course;
    try{
        course=await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"Could not find the course"
            })
        }

        // check user already pay for the same course or not 
        // converting the user id(string) into object bcz inside the Course model user id is stored in object format so i have to convert the string to object id
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.json({
                success:false,
                message:"Student is already enrolled"
            });
        }
    }


    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
    // order create  inside which i have to pass amount and currency which are mandatory parameters 
    const amount=course.price;
    const currency="INR";

    const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{ // iam passing the courseId and UserID so that i will  verify the signature and digest and fetch the courseId and userID from razorpay 
            courseId: course_id,
            userId
        }
    };

    try{
        // initiate the payment using razorpay 
        const paymentResponse=await instance.orders.create(options);
        console.log(paymentResponse);
        // return response  
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    }

    catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Could not initiate order",
        })
    }
}


// Payment creation done by upper hanlder





// 2nd handler Verify signature of razorpay and server

exports.verifySignature=async(req,res)=>{
    const webhookSecret="12345678"; //server signature

    const signature=req.headers["x-razorpay-signature"];    //inside this key the signature is present when razrpay hits that header this is razorpay signature 

                        //by using this fxn i can convert the data into the encrypted format .It basically takes 2 things- hashing algorith and second is the secretkey i.e on which secret_key i have to use the fxn 
                        // Hmac = hashed based message authentication code 
                        // sha - secure hashing algo  
    const shasum=crypto.createHmac("sha256",webhookSecret);  //hmac object

    // convert this hmac object into string format 
    shasum.update=(JSON.stringify(req.body));

    // when will be run the hashing algorithm then at some text there comes some output and we will show that output in the form of some cases format and the term is known as digest which is  basically in hexadecimal format 
    const digest=shasum.digest("hex"); //converted the webhooksecret into digest 

    // now we have to match the signature with digest 
    if(signature===digest){
        console.log("Payment is authorized");

        // after that the request which is coming by doing the action on verifySignature is basically coming from razorpay and i also need courseId and we have passed 2 things inside the notes i will fetch those 2 things by using below fxn 

        const {userId,courseId}=req.body.payload.payment.entity.notes;
        try{
            // fulfil the action 

            // find the course and enroll the student in it 
            const enrolledCourse=await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{enrolledCourse:userId}},
                {new: true},
            )

            if(!enrolledCourse){
                return res.json({
                    success:false,
                    message:"Course not found",
                })
            }

            console.log(enrolledCourse);

            // find the student and add the course to their list of enrolled courses 
            const enrolledStudent=await User.findOneAndUpdate(
                {_id:userId},
                {$push: {courses:courseId}},
                {new:true},
            );

            console.log(enrolledStudent);

            // Send the confirmation mail 
            const emailResponse=await mailSender(
                enrolledStudent.email,
                "Congratulations from Codehelp",
                "Congratulations, you are onboarded into new Codehelp Course",
            );

            console.log(emailResponse);

            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added"
            })

        }

        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    // if signature not match 
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid request",
        })
    }

}