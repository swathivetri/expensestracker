const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticate = (req, res, next) => {

    try {
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log( user.userId)
        User.findByPk(user.userId).then(user => {

            req.user = user; ///ver
            next();
        }).catch(err => { throw new Error(err)})

      } catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
      }

}

module.exports = {
    authenticate
}