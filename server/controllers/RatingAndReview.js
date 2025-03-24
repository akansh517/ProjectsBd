const RatingAndReview=require('../models/RatingAndReviews');
const Course=require('../models/Course');
const { default: mongoose } = require('mongoose');


// create Rating 
exports.createRating=async(req,res)=>{
    try{
        // get user id 
        const userId=req.user.id;
        // fetch data from req body
        const{rating,review,courseId}=req.body;
        // check if user is enrolled or not 
        const courseDetails=await Course.findOne( //from the courses i have find out the courseId of the course and find out the studentsEnrolled and matched the userId that the student is enrolled in course or not 
                            {_id:courseId ,
                            studentsEnrolled:{$elemMatch: {$eq: userId}},     //$elemMatch and $eq operator 
                            }
        )

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course"
            });
        }
        // check if user has already reviewed the course or not 
        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user"
            })
        }
        // create rating and review 
        const ratingReview=await RatingAndReview.create({rating,review,
                                                        course:courseId,user:userId});
        // update course with this rating and review 
        const updatedCourseDetails=await RatingAndReview.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview._id
                }
            },
            {new:true}
            );

            console.log(updatedCourseDetails);
        // return response 
        return res.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            ratingReview
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



// getAverageRating 

exports.getAverageRating=async(req,res)=>{
    try{
        // get courseId 
        const courseId=req.body.courseId;
        // calculate avg rating 
        const result=await RatingAndReview.aggregate([ //aggregatefxn returns an array
            {
                $match:{    //match all the entries in the course where courseId related course is present
                    course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                     _id:null,//if i don't have idea on what basis i will apply group then i will use null
                    averageRating:{$avg:"rating"},
                }
            }
        ])

        // the above aggregate fxn is returning an array so i will fetch the value of result from the 1st index of the array 
        // return rating 
        
        if(result.length>0){        //if review rating exist 
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
        }
        //  if no review rating exist 
        return res.status(200).json({
            success:true,
            message:"Average Rating 0, no rating given till now",
            averageRating:0,
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




// getAllRatingAndReviews

exports.getAllRatingAndReviews=async(req,res)=>{
    try{
        // find query 
        const allReviews=await RatingAndReview.find({})
                                    .sort({rating:"desc"})//means 5*,4*,3* in this order rating will come           
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image"
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName"
                                    })
                                    .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
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


