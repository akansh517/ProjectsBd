const Razorpay=require('razorpay');

require('dotenv').config();

exports.instance=new Razorpay({ //created the razorpay instance 
    key_id:process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECRET
})