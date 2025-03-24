const Profile=require('../models/Profile');
const User=require('../models/User');//profile is linked with the user

// there is no need to create profile bcz profile has already been created we just need to update its null value only 

exports.updateProfile=async(req,res)=>{
    try{
        // get data dateOfBirth and about are not mandatory to fill
        const{dateOfBirth="",about="",contactNumber,gender}=req.body;
        // get userId 
        const id=req.user.id;
        // validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required ",
            });
        }
        // find Profile 
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);
        // update Profile 
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;

        // we are updating the changes inside the object so here we will use save method to do changes inside the database 
        await profileDetails.save();
        // return response 
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}




// deleteAccount 
// HW: How can we schedule the this delete operation 

exports.deleteAccount=async(req,res)=>{
    try{
        // get id 
        const id =req.user.id;
        // validation 
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        // delete profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // TODO: HW unenroll user from all enrolled courses lets say my batch includes 100 students suppose one student has deleted the account after that 99 students will be enrolled so we have to perform this basically
        // delete user 
        await User.findByIdAndDelete({_id:id});
        // return response 
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully"
        })
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted successfully"
        })
    }
}



exports.getAllUserDetails=async(req,res)=>{
    try{
        // get id 
        const id=req.user.id;
        // validation and get user details 
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        // return response 
        return res.status(200).json({
            success:true,
            message:"User Data fetched successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}