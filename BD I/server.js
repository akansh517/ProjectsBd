// step1:create a folder
// step2:move into that folder
// step3:npm init -y
// step4:open folder using vs code
// step5:npm i express
// step6:create server.js



//Server instantiate using express
const express=require('express');
const app=express();


//use to parse request.body in express->    PUT or POST
const bodyParser=require('body-parser');
// bodyParser ke object se server ko power up krna chhata hu toh uske liya niche vali use cmd use krenga 

// specifically parse JSON data and add it to the request.Body object
app.use(bodyParser.json());//yaha par specifically bol rahe hai ki json() data ko parse krna hai or usko request ki body main dalna hai


// Activate the server on 8000 port 
app.listen(8000,()=>{
    console.log("Server started at port no. 8000");
})

// get request ke through data fetch krta hu 
// jab bhi sever par home vala route par aunga toh response main string milegi 
//Routes
app.get('/',(request,response)=>{
    response.send("Hi Guys,kese ho");
})

// post ke andar data body ke andar dalenge 
// main koi data submit krna chahta hu is liya post request ka use kiya hai 
app.post('/api/cars',(request,response)=>{
    const{name,brand}=request.body; //destructuring krke name or brand nikal liya request main se jab is route par jaunga
    console.log(name);
    console.log(brand);
    response.send("Car submitted successfully");
})

// post request ko verify krne ke liya use krunga postman 
// api ki testing,designing yaa documentation krni ho toh collaboration tool hota hai postman 



// middle ware tool hota hai jo request ki body main se parsing krta hai 


// agar mujhe server ko db ke sath connect krna ho toh main use krunga mongoose ka jo bich ki layer hoti hai jiske through main db or express yaa node ko connect krta hu isko hum odm library bhi kehte hai 



// node js ke andar data ko object ki form m treat kr rahe hai 
// mongo db main data ko treat kr rahe hai document ki form main 

// Inke bich ki mapping ko sambhalna if.e usko facilitate krna odm libaray ki through

// odm-object data modelling 
// iske through hum schema creation, validation vgera kr skte hai 

// express ek chota sa framework hai jo node js par kaam krna asan kr deta hai 
// node js parent entity hai 



// linking ka kaam krna hai jiske through m express ko link kr pau db ke sath 

const mongoose=require('mongoose');

 //local host par chalane ke liya in 2 configuration ko use krke kaam bn jaega vse 4 use hoti hai {} configuration hai 

 // throwing error  below code by writing localhost
//  mongoose.connect('mongodb://localhost:27017/myjain',{  
    
mongoose.connect('mongodb://127.0.0.1:27017/myjain',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

// or pura part ek promise hai mongoose so iske upar then or catch fxn laga skte hai or promise yaa toh resolve hoga yaa reject hoga

// successfull ke case main then method chalta tha promise main 

.then(()=>{console.log("Connection Successfull")})

.catch( (error) => {console.log(error)} );

// so upar vale mongoose ke code ke through connection establish kr diya hai between mongo db and server i.e(express)

// mongodb compass default 27017 port par kaam krta hai or uske baad /database ka name dena hai agar main esa data base ka naam dedu jo create nhi hai toh data base create ho jaega or is connect main 2 chize jati hai configuration ka object send krna hota hai 