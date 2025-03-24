const Course=require('../models/Course');
const Tag=require('../models/Tag');
const User=require('../models/User');
const {uploadImageToCloudinary}=require('../utils/imageUploader');


// createCourse handler function 
exports.createCourse=async(req,res)=>{
    try{
        // fetch data
        //tags reference is send means the tag is am fetching contains only id bcz inside the course tag is referred
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
        // get thumbnail 
        const thumbnail=req.files.thumbnailImage;

        // validation 
        if(!courseName || !courseDescription || !!whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(404).json({
                success:false,
                message:"All fields are required"
            })
        }

        // check for instructor 
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);  //fetching the object id of instructor bcz at the time of creating newCourse i need instructor object id 
        console.log("Instructor Details: ",instructorDetails);

        // TODO: Verify that userID and instructorDetails._id are same 

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found"
            })
        }

        // check given tag is valid or not 
        const tagDetails=await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found"
            });
        }

        // Upload image to cloudinary 
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry for new Course 

        // whenever i will create a new Course then i have to put instructor id that i will fetch from instructor object id and also inside the course model tag object id passed and in the thumbnail i have to pass secure_url to display an image 
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        // add the new Course to the user schema of instructor 
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},    //search according to instructor id 
            { $push :                   
                {courses:newCourse._id}     //push newCourse inside the courses array
            },
            {new:true}                      //update the document 
        )


        // update the tag schema after adding the course
        // TODO: HW


        return res.status(200).json({
            success:true,
            message:"Course created sucessfully",
            data:newCourse,
        })

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message
        })
    }
}





// showAllCourses handler function 

exports.showAllCourses=async(req,res)=>{
    try{
        // TODO : change the below statement incrementally
        const allCourses=await Courses.find({},{courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true})
                                                .populate("instructor")
                                                .exec();
        
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    }
    
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        })
    }
}


// getCourseDetails handler
exports.getCourseDetails=async(req,res)=>{
    try{
        // get id 
        const {courseId}=req.body;
        // find course details the things which i have passed as reference in Course model will be populated so that all details related to it will be fetched 
        const courseDetails=await Course.findById(
                        {_id:courseId})
                        .populate({
                            path:"instructor",
                            populate:{
                                path:"additionalDetails", //the details with instructor and its additional details is also populated by this 
                            }
                        })
                        .populate("category")
                        .populate("ratingAndReviews")
                        .populate({
                            path:"courseContent",
                            populate:{
                                path:"subSection",
                            }
                        })
                        .exec();
        // validation 
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not found the course with ${courseId}`,
            })
        }

        // return response 
        return res.status(200).json({
            success:true,
            message:`Course Details fetched successfully`,
            data:courseDetails
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


