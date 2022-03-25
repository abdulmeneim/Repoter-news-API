const express = require('express')
const NEWS = require('../models/News')
const router = express.Router()
const auth = require('../middelware/auth')
const mutler = require("multer")



router.post('/News', auth, async (req, res) => {
    try {
        // ... spread operator copy data
        const news = new NEWS({ ...req.body, Reporter: req.Reporter._id })
        await news.save()
        const createtime = new Date(news.createdAt.setHours(news.createdAt.getHours() + 2)).toUTCString();
        const updatetime = new Date(news.updatedAt.setHours(news.updatedAt.getHours() + 2)).toUTCString();
        console.log({ news, "createdat": createtime, "updatedat": updatetime });
        res.status(200).send(news)
    }
    catch (e) {
        res.status(400).send(e.message)
    }

})

router.get('/News', auth, async (req, res) => {
    try {
        await req.Reporter.populate('News')
        res.status(200).send(req.Reporter.News)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})


router.get('/News/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);
        const news = await NEWS.findOne({ _id: req.params.id, Reporter: req.Reporter._id })
        console.log(news)
        if (!news) {
            return res.status(404).send('Unable to find the news')
        }
        /*  const createtime = news.createdAt.setHours(news.createdAt.getHours() + 2).toUTCString();
         const updatetime = news.updatedAt.setHours(news.updatedAt.getHours() + 2).toUTCString(); */
        const createtime = new Date(news.createdAt.setHours(news.createdAt.getHours() + 2)).toUTCString();
        const updatetime = new Date(news.updatedAt.setHours(news.updatedAt.getHours() + 2)).toUTCString();
        console.log({ news, "createdat": createtime, "updatedat": updatetime });
        res.send({ news, "createdat": createtime, "updatedat": updatetime })
    }
    catch (e) {
        console.log(e.message);
        res.status(500).send(e.message)
    }
})

router.patch('/News/:id', auth, async (req, res) => {
    try {
        const id = req.params.id
        const news = await NEWS.findOneAndUpdate({ _id: id, Reporter: req.Reporter._id }, req.body, {
            new: true,
            runValidators: true
        })
        if (!news) {
            return res.status(404).send('No news to up date')
        }
        res.status(200).send(news)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})


router.delete('/News/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await NEWS.findOneAndDelete({ _id, Reporter: req.Reporter._id })
        if (!news) {
            return res.status(404).send('No news is found')
        }
        res.status(200).send(news)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})

router.get('/News_reporter/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await NEWS.findOne({ _id, owner: req.Reporter._id })
        if (!news) {
            return res.status(404).send('No task')
        }
        await news.populate('Reporter') // refrence 
        res.status(200).send(news.Reporter)
    }
    catch (e) {
        res.status(500).send(e)
    }
})
const uploads = mutler({

    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|PNG|jfif)$/)) {
            return cb(new Error('Please upload image'))

        }
        cb(null, true)

    }
})

router.post('/News/image/:id', auth, uploads.single('image'), async (req, res) => {
    try {
        const news = await NEWS.findOne({ _id: req.params.id, Reporter: req.Reporter._id })
        console.log(news);
        news.image = req.file.buffer
        await news.save()
        console.log("done");
        res.send()
    }
    catch (e) {
        res.send(e)
    }
})
router.delete('/News/image/:id', auth, async (req, res) => {
    try {
        const news = await NEWS.findOne({ _id: req.params.id, Reporter: req.Reporter._id })
        console.log(news);
        news.image = new Buffer.from("")
        await news.save()
        console.log("done");
        res.send()
    }
    catch (e) {
        res.send(e)
    }
})

module.exports = router