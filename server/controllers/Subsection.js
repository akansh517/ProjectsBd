const SubSection=require('../models/SubSection')
const Section=require('../models/Section');  // inside the section i will insert the id of subsection
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const SubSection = require('../models/SubSection');

exports.createSubSection=async(req,res)=>{
    try{
        // fetch data from req body 
        const{sectionId,title,timeDuration,description}=req.body;
        // extract video/file 
        const video=req.files.videoFile;
        // validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        // upload video to Cloudinary so that we get secure_url after uploading the video
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create a SubSection
        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })
        // update section with this SubSection object id 
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},
                                                            {$push:{
                                                                subSection:subSectionDetails._id,
                                                            }},
                                                            {new :true}
                                                            );

                                                            // so in the above case all the data will be stored in the form of id but i want to show all the details then i will use the populate method in this case 
        // HW: log updated section here after adding populate query 
        // return response 
        return res.status(200).json({
            success:true,
            message:"Sub Section created Successfully",
            updatedSection
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server error",
            error:error.message
        })
    }
}


// HW:  updateSubSection
// HW:  deleteSubSection
