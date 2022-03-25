const mongoose = require('mongoose')
const NewsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: Buffer
    },
    Reporter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reporter' //Model
    }
}, { timestamps: true })
const News = mongoose.model('News', NewsSchema)
module.exports = News