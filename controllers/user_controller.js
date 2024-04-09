const {User} = require('../models/user_model');

exports.getUsers = async (req, res, next) => {
    try{
        const users = await User.find().select('name email _id isAdmin');
        if(!users) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.json(users);
    }catch(e) {
        return res.status(500).json({type: e.name, message: e.message});
    }
}

exports.getUserById = async (req, res, next) => {
    try{
        const user = await User.findById(req.params.id).select('-passwordHash -resetPasswordOTP -resetPasswordOTPExpires');
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.json(user);
    }catch(e) {
        return res.status(500).json({type: e.name, message: e.message});
    }
}

exports.updateUser = async (req, res, next) => {
    try{
        const {name, email, phone} = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, {name, email, phone}, {new: true});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        user.passwordHash = undefined;
        // await user.save();
        return res.json(user);
    }catch(e) {
        return res.status(500).json({type: e.name, message: e.message});
    }
}