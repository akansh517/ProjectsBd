const mongoose=require('mongoose');

const tagSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    // one tag contains multiple courses thats why i am putting all courses into an array 
    course:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ]
})

module.exports=mongoose.model("Tag",tagSchema);