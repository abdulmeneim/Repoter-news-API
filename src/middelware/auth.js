const jwt = require('jsonwebtoken')
const Reporters = require('../models/Reporter')
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log(token)
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const reporter = await Reporters.findOne({ _id: decode._id, tokens: token })
        if (!reporter) {
            throw new Error()
        }
        req.Reporter = reporter
        req.token = token
        next()
    }
    catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}
module.exports = auth