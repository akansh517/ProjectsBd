const Section=require('../models/Section');
const Course=require('../models/Course');
const { findByIdAndDelete } = require('../models/CourseProgess');

// create section 
exports.createSection=async(req,res)=>{
    try{

    
        // data fetch 
        const{sectionName, courseId}=req.body;
        // data validation 
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            })
        }
        // create section 
        const newSection=await Section.create({sectionName});
        // update course with section ObjectId 
        const updatedCourseDetails=await Course.findByIdAndUpdate(
                                    courseId,
                                    {
                                        $push: {
                                            courseContent:newSection._id,
                                        }
                                    },
                                    {new:true},
                                    );
        // HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        // return response 
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails,
        })
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create session,please try again",
            error:error.message,
        })
    }
}






// updateSection 

exports.updateSection=async(req,res)=>{
    try{
        // data input 
        const {sectionName,sectionId}=req.body;
        // data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            })
        }
        // update data - if i am updating the data inside the section then there is no need to update the data inside the course 
        const section=Section.findByIdAndUpdate(sectionId,{sectionName},{new :true});
        // return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create session,please try again",
            error:error.message,
        })
    }
}




// deleteSection 

exports.deleteSection=async(req,res)=>{
    try{
        // get Id=assuming that we are sending ID in params 
        // const {sectionId}=req.params; //test with req.params
        const {sectionId}=req.body 
        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        // TODO[Testing] : Do we need to delete the entry from the course schema ? 
        // TODO update the course after deletion of section
        // return response 
        return res.status(200).json({
            success:true,
            message:"Section deleted Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete session,please try again",
            error:error.message,
        })
    }

}