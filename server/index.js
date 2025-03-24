const express=require('express');
const app=express();

const userRoutes=require('./routes/User');
const profileRoutes=require('./routes/Profile');
const paymentRoutes=require('./routes/Payments');
const courseRoutes=require('./routes/Course');

const database=require('./config/database');
require('dotenv').config();
const cors=require('cors');
const {cloudinaryConnect}=require('./config/cloudinary');
const fileUpload=require('express-fileupload');
const cookieParser=require('cookie-parser');

const PORT=process.env.PORT || 4000;

// database connect 
database.connect();

// middlewares 
app.use(express.json());
app.use(cookieParser());
app.use(    //cors is very important we should have to use cors after that only we can entertain with the request i.e the request 
    cors({  //which is coming from the frontend which i can entertain using only cors  
        origin:"http://localhost:3000",
        credentials:true,
    })
) 

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)


// cloudinaryConnection 

cloudinaryConnect();

// mounting of routes 

app.use('/api/v1/auth',userRoutes);
app.use('/api/v1/profile',profileRoutes);
app.use('/api/v1/course',courseRoutes);
app.use('/api/v1/payment',paymentRoutes);


// default route  
app.get('/',(req,res)=>{
    return res.json({
        success:true,
        message:`Your server is up and running.....`
    })
})


// activate the server 
app.listen(PORT,()=>{
    console.log(`App is running at ${PORT}`);
})