const mongoose=require('mongoose')
const messageModel=mongoose.Schema({
    
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        type:String,
        trim:true,
    },
    mediaFiles:{
         type:String,
          trim:true
        
    },
    type:{type:String,default:"text"},
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
    },
},
{
    timestamps:true,
});

const Message=mongoose.model("Message",messageModel);
module.exports=Message;