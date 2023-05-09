const asyncHandler=require('express-async-handler')
const User=require("../models/userModel")

const generateToken=require("../config/generateToken")

const registerUser= asyncHandler(async (req,res)=>{
    const {name ,email,password,pic} =req.body;

    if(!name || !email || !password)
    {
        res.status(400);
        throw new Error("Please Enter All The Feilds");
    }

    const userExists =await User.findOne({email});

    if(userExists)
    {
        res.status(400);
        throw new Error("User Already Exist!")
    }

    const user=User.create({
        name,
        email,
        password,
        pic
    });
    if(user)
    {
        res.status(201).json({
            _id:user._id,
            name:user.name,
            password:user.password,
            pic:user.pic,
            token:generateToken(user._id),
        });
    }else{
        res.status(400);
        throw new Error("Failed To Craete New user");
    }
})

//api/user/userId
const getUser =asyncHandler(async(req,res)=>{

    try {
        var user = await User.find({_id:req.params.userId})
               .populate("notificationReceived")
               .populate({path:'notificationReceived',
            populate : { path : 'sender'}})
            .populate({path:'notificationReceived',
            populate : { path : 'chat'}});
               
            
           
        return res.status(200).json(user);
        
    } catch (error) {
         res.status(400);
        throw new Error(error.message);
    }
})
//api/user/login
const authUser=asyncHandler(async(req,res)=>{
 const {email,password} =req.body;
 
    const user =await User.findOne({email});
const matchStatus= await user.matchPassword(password);
console.log(matchStatus);
    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            password:user.password,
            pic:user.pic,
            token:generateToken(user._id),
        })
    }else{
        res.status(401);
        throw new Error("Invalid Email or Password");
    }

})

//api/user?search=vikash
const allUsers = asyncHandler(async (req,res)=>{
const keyword =req.query.search ?{
    $or:[{name:{$regex:req.query.search,$options:"i"}},
         {email:{$regex:req.query.search,$options:"i"}},
       ]
      }
      :{};
      const users= await User.find(keyword).find( {_id:{$ne:req.user._id}});
      res.send(users);

});

    //api/user/notification/added
const notificationReceived = asyncHandler(async (req,res)=>{
    const {userId,message} =req.body;
    if(!userId || !message)
{
    console.log("Invalid data passed to request");
    return res.sendStatus(400);
}
    try {
        const getUser =await User.findOne({_id:req.body.userId});
         getUser.notificationReceived.push(message);
         await getUser.save();
         
         return res.status(200).json(getUser);
        
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
    });


    //api/user/notification/deleted
    const notificationDeleted = asyncHandler(async (req,res)=>{
    const { userId,notifyId } =req.body;
    if(!userId && !notifyId)
{
    console.log("Invalid data passed to request");
    return res.sendStatus(400);
}
    try {
        console.log("delet notifi");
        const getUser =await User.findOne({_id:req.body.userId});
           getUser.notificationReceived.pull({_id:notifyId})
           await getUser.save();

    //     const getUser=   User.updateOne({ _id:req.body.userId }, {
    //  $pullAll: {
    //     notificationReceived: {_id: notifyId},
    //   },
    //   });
        // const updateNotification =await User.findByIdAndUpdate(req.body.userId,{
        //  notificationReceived:null,
        // });
       // res.json(updateNotification);
       return res.status(200).json(getUser);
        
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
    });

const logoutUser =asyncHandler(async(req,res)=>{
try {
    const {userId}=req.body;
    const {user} =await User.findByIdAndUpdate(userId,{isOnline:false},{new:true})
    return res.status(200).json(user);
} catch (error) {
    res.status(400);
        throw new Error(error.message);
}
    
})

module.exports={registerUser,authUser,getUser,
    allUsers,notificationReceived ,notificationDeleted,logoutUser};