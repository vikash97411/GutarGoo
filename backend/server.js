const express=require('express')
const dotenv=require('dotenv')
const {chats}=require('./Data/data')
const connectDB=require("./config/db")
const colors=require('colors')
const userRoutes=require("./routes/userRoutes")
const chatRoutes=require("./routes/chatRoutes")
const messageRoutes=require("./routes/messageRoutes")


const {notFound ,errorHandler} =require("./middlewares/errorMiddleware")
const User = require('./models/userModel')
const app=express()
const path=require("path")
const url = require('url');
app.use(express.json())

dotenv.config()
connectDB()
app.use("/api/user",userRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/message",messageRoutes)


//________________________________ Deployment code________________________

const __dirname1 = path.resolve();
if(process.env.NODE_ENV=='production')
{
app.use(express.static(path.join(__dirname1,"/frontend/build")));
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
})
}else{
app.get("/",(req,res)=>{
    res.send("API IS Running!")
});
}

//________________________________ Deployment code________________________


 app.use(notFound);
 app.use(errorHandler);

const PORT=process.env.PORT||5000
const server=app.listen(PORT,console.log(`server is running at port ${PORT}`.yellow.bold))

const io= require('socket.io')(server,{
    pingTimeOut: 60000,
    cors:{
        origin:"http://localhost:3000",
    },
});

io.on("connection",async(socket)=>{
    const userId=socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id:userId},{$set:{isOnline:true}});

   console.log(socket.handshake.auth.token);
    console.log(`connected to ${socket.id}`);
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat",(room)=>{
        socket.join(room);
        console.log("User joined Room:"+ room);
    });

    socket.on("new message",(newMessageReceived)=>{
        var chat = newMessageReceived.chat;
        chat.users.forEach((user) => {
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("typing",(room)=>socket.in(room).emit("typing"));
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"));

    socket.on("disconnect", async() => {
    await User.findByIdAndUpdate({_id:userId},{$set:{isOnline:false}});
    console.log("Disconnect to",socket.id); // undefined
    });

    socket.off("setup",async()=>{
         await User.findByIdAndUpdate({_id:userId},{$set:{isOnline:false}});
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
