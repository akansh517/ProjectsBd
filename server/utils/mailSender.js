const nodemailer=require('nodemailer');
require('dotenv').config();
// inside the fxn input i am giving email,title or body 
// i have written the mailSender fxn so that i can send the mail when will i have to enter the otp for verification 
const mailSender= async(email,title,body)=>{
    try{
        let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })

        let info=transporter.sendMail({
            from: "StudyNotion || by Jain",
            to: `${email}`,//the email which i have given in the fxn i want to send to that person
            subject:`${title}`,
            html:`${body}`
        })

        console.log(info);
        return info;
    
    }
    catch(error){
        console.log(error.message);
    }
}


module.exports=mailSender;