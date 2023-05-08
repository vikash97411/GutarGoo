const mongoose=require('mongoose')
const bcrypt=require("bcryptjs")
const userSchema=mongoose.Schema({
    
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    isOnline:{
        type:Boolean,
        default:false,
    },
     password:{
        type:String,
        require:true,
    },
    pic:{
        type:String,
       
        // default:"https://www.seblod.com/images/medias/62057/_thumb2/2205256774854474505_medium.jpg"
    },
    notificationReceived:
    
            [{
            type:mongoose.Schema.Types.ObjectId,
             ref:"Message",
            
                          
        },],
    
       
    
},
{
    timestamps:true,
});

userSchema.methods.matchPassword=function(enteredPassword){
    
   return (enteredPassword == this.password);
}

userSchema.pre('save', function(next){

   this.password=this.password;
   
    next();
})

const User=mongoose.model("User",userSchema);
module.exports=User;