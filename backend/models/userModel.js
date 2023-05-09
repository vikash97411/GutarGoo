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
       
        default:"https://www.seblod.com/images/medias/62057/_thumb2/2205256774854474505_medium.jpg"
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

userSchema.methods.matchPassword=async function(enteredPassword){
    console.log(enteredPassword,this.password);
    return await bcrypt.compare(enteredPassword , this.password);
  // return (enteredPassword == this.password);
}

userSchema.pre('save',async function(next){
    if(!this.isModified)
    {
        next();
    }
  //this.password=this.password;
     const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
})

const User=mongoose.model("User",userSchema);
module.exports=User;