const cloudinary=require('cloudinary').v2;

// fxn for uploading the file to cloudinary cloud db
// height and quality attribute is used for data compression 
exports.uploadImageToCloudinary=async(file,folder,height,quality)=>{
    const options={folder};
    if(height){
        options.height=height;
    }
    if(quality){
        options.quality=quality;
    }
    options.resource_type="auto";
    return await cloudinary.uploader.upload(file.tempFilePath,options);
}