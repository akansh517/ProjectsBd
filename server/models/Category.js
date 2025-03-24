const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    // one tag contains multiple courses thats why i am putting all courses into an array 
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ]
})

module.exports=mongoose.model("Category",categorySchema);