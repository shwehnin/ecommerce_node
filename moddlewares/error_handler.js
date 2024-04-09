const jwt = require('jsonwebtoken');
const {Token} = require('../models/token_model');
const {User} = require('../models/user_model');

async function errorHandler(error, req, res, next) {
    if(error.name === 'UnauthorizedError') {
        if(!error.message.includes('jwt expired')) {
            return res.status(error.status).json({type: error.name, message: error.message});
        }

        try{
            const tokenHeader = req.header('Authorization');
            const accessToken = tokenHeader.split(' ')[1];
            const token = await Token.findOne({accessToken, refreshToken: {$exists: true}});

            if(!token) {
                return res.status(401).json({type: 'Unauthorized', message: 'Token does not exist'})
            }

            const userData = await jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN);

            const user = await User.findById(userData._id);
            if(!user) {
                return res.status(404).json({message: "User does not exist."});
            }

            const newAccessToken = jwt.sign({
                _id: user._id,
                isAdmin: user.isAdmin,
            }, process.env.ACCESS_TOKEN, {expiresIn: '24h'});

            req.headers['authorization'] = `Bearer ${newAccessToken}`;

            await token.updateOne({_id: token._id}, {accessToken: newAccessToken,}).exec();

            res.set('Authorization', `Bearer ${newAccessToken}`);

            return next();

        }catch(e) {
            return res.status(401).json({type: 'Unauthorized', message: e.message});
        }
    }
    return res.status(404).json({type: error.name, message: error.message});
}

module.exports = errorHandler;