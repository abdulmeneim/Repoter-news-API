const express = require('express')
const router = express.Router()
const Reporter = require('../models/Reporter')
const auth = require('../middelware/auth')
const multer = require('multer')


router.post('/Reporter', async (req, res) => {
    try {
        const reporter = new Reporter(req.body)
        const token = await reporter.generateToken()
        await reporter.save()
        res.status(200).send({ reporter, token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

// login

router.post('/login', async (req, res) => {
    try {
        const reporter = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({ reporter, token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

//////////////////////////////////////////////////////////////////////////

router.get('/profile', auth, async (req, res) => {
    res.status(200).send(req.Reporter)
})

////////////////////////////////////////////////////////////////////////

// logout 

router.delete('/logout', auth, async (req, res) => {
    try {
        console.log(req.Reporter)
        req.Reporter.tokens = req.Reporter.tokens.filter((el) => {
            return el !== req.token
        })
        await req.Reporter.save()
        res.send()
    }
    catch (e) {
        res.status(500).send(e)
    }

})


router.delete('/logoutAll', auth, async (req, res) => {
    try {
        req.Reporter.tokens = []
        await req.Reporter.save()
        res.send()
    }
    catch (e) {
        res.status(500).send(e)
    }
})
// get all Reporters
router.get('/Reporters', auth, (req, res) => {
    Reporter.find({}).then((Reporters) => {
        res.status(200).send(Reporters)
    }).catch((e) => {
        res.status(500).send(e)
    })
})


router.get('/Reporter', auth, (req, res) => {
    const _id = req.Reporter._id
    Reporter.findById(_id).then((reporter) => {
        if (!reporter) {
            return res.status(404).send('Unable to find Reporters')
        }
        res.status(200).send(reporter)
    }).catch((e) => {
        res.status(500).send(e)
    })
})

router.patch('/Reporter', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body)
        const reporter = req.Reporter
        if (!reporter) {
            return res.status(404).send('No Reporter is found')
        }
        updates.forEach((update) => (reporter[update] = req.body[update]))
        await reporter.save()
        res.status(200).send(reporter)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/Reporter', auth, async (req, res) => {
    try {

        /* const reporters = await Reporters.findByIdAndDelete(_id)*/
        const reporter = req.Reporter
        if (!reporter) {
            return res.status(404).send('Unable to find Reporter')
        }
        const deletedreporter = await Reporter.remove({ _id: req.Reporter._id })
        res.status(200).send(deletedreporter)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

const uploads = multer({

    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
            return cb(new Error('Please upload image'))

        }
        cb(null, true)

    }
})

router.post('/profile/avatar', auth, uploads.single('avatar'), async (req, res) => {
    try {
        req.Reporter.avatar = req.file.buffer
        await req.Reporter.save()
        res.send()
    }
    catch (e) {
        res.send(e)
    }
})
router.delete('/profile/avatar', auth, async (req, res) => {
    try {
        req.Reporter.avatar = new Buffer.from("")
        await req.Reporter.save()
        res.send()
    }
    catch (e) {
        res.send(e)
    }
})
module.exports = router
