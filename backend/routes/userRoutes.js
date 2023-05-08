const express= require('express')
const router =express.Router()
const {registerUser,authUser, allUsers,
     notificationReceived, notificationDeleted,getUser, logoutUser} = require("../controllers/userControllers");

const { protect } = require('../middlewares/authMiddleware');

router.route("/").post(registerUser).get(protect,allUsers);
router.route("/:userId").get(protect,getUser)
router.post('/login',authUser)
router.post("/notification/added",notificationReceived);
router.post("/notification/deleted",notificationDeleted);
router.route("/logout").post(protect,logoutUser);
// router.route("/").get(allUsers)

module.exports =router;