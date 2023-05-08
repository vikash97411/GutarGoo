const asyncHandler=require("express-async-handler")
const Message=require("../models/messageModel")
const User=require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage=asyncHandler(async(req,res)=>{
const {content ,type, chatId,mediaFiles} =req.body;
if(!content || !chatId || !mediaFiles)
{
    console.log("Invalid data passed to request");
    return res.sendStatus(400);
}
var newMessage={
    sender:req.user._id,
    content:content,
    mediaFiles:mediaFiles,
    type:type,
    chat:chatId,
};
try {
    var message=await Message.create(newMessage);
    
    message= await message.populate("sender","name pic isOnline")
     message= await message.populate("chat")
     message =await User.populate(message,{
        path:'chat.users',
        select:'name email pic isOnline',
     });
await Chat.findByIdAndUpdate(req.body.chatId,{
    latestMessage:message,
});

res.json(message);

} catch (error) {
    res.status(400);
    throw new Error(error.message);
}
});


const allMessages=asyncHandler(async(req,res)=>{
try {
    const messages =await Message.find({chat:req.params.chatId})
                    .populate("sender","name email pic isOnline")
                    .populate("chat");
    res.json(messages);
    
} catch (error) {
    res.status(400);
    throw new Error(error.message);
    
}
});


module.exports ={sendMessage,allMessages}
