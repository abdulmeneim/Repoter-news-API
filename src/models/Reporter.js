const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const ReporterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    adress: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isMobilePhone(value, 'ar-EG')) {
                throw new Error('phone number is invalid')
            }
        }


    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            let password = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if (!password.test(value)) {
                throw new Error('Password must include uppercase,lowercase,numbers,speical character')
            }
        }
    },
    tokens: [
        {
            type: String,
            required: true
        }
    ],
    avatar: {
        type: Buffer
    },

}, { timestamps: true })

////////////////////////////////////////////////////////////////////////

// virtual relation
ReporterSchema.virtual('News', {
    ref: 'News',
    localField: '_id',
    foreignField: 'Reporter'

})


///////////////////////////////////////////////////////////////////
// password
// npm i bcryptjs
ReporterSchema.pre('save', async function () {
    // this --> document
    const reporter = this
    if (reporter.isModified('password'))
        reporter.password = await bcryptjs.hash(reporter.password, 8)
})

////////////////////////////////////////////////////////////////////////

ReporterSchema.statics.findByCredentials = async (em, password) => {

    const reporter = await Reporter.findOne({ email: em })
    if (!reporter) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcryptjs.compare(password, reporter.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return reporter
}
/////////////////////////////////////////////////////////////////////////////
ReporterSchema.methods.generateToken = async function () {
    const reporter = this
    const token = jwt.sign({ _id: reporter._id.toString() }, process.env.JWT_SECRET)
    reporter.tokens = reporter.tokens.concat(token)
    await reporter.save()
    return token
}
////////////////////////////////////////////////////////////////////////

ReporterSchema.methods.toJSON = function () {
    const reporter = this
    const userObject = reporter.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}


const Reporter = mongoose.model('Reporter', ReporterSchema)
module.exports = Reporter