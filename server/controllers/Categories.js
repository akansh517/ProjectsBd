const Category=require('../models/Category');

// createTag handler fxn 

exports.createCategory=async(req,res)=>{
    try{
        // fetch data from request body 
        const {name,description}=req.body;
        // validation 
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        // create entry in db 
        const categoryDetails=await Tag.create({
            name:name,
            description:description
        })
        console.log(categoryDetails);
        // return response 
        return res.status(200).json({
            success:true,
            message:"Tag created successfully"
        })
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}




//showAll tags handler 

exports.showAllcategories=async(req,res)=>{
    try{
        // means that it will find all the tags along with its name and description 
        const allCategories=await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message: "All tags are returned successfully",
            allCategories
        })
    }
    
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



// CategoryPage details handler 

exports.categoryPageDetails=async(req,res)=>{
    try{
        // get categoryId
        const {categoryId}=req.body;
        // get courses for specified categoryId
        const selectCategory=await Category.findById(categoryId)
                                    .populate("courses")
                                    .exec();
        // validation => It can be possible that there is no course for that categoryId 
        if(!selectCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found",
            })
        }
        // get courses for different categories like suggestions 
        // i want to find that categories whose id is not equal to the categoryId so i will use $ne operator (not equal)

        const differentCategories=await Category.find(
                                {
                                 _id:{$ne:categoryId}
                                })
                                .populate("courses")
                                .exec();

        
        // get top 10 selling course -> HW need of variable i.e which course is top sold and which is less sold
        // if i have some number corresponding to the particular course that how many students have enrolled for that particular course then i will sort according to it and will find out the top selling enrolled courses 

        // return response  

        return res.status(200).json({
            success:true,
            data:{
                selectCategory,
                differentCategories,
                //top selling 
            }
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


