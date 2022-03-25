// CRUD operations
const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

require('./db/mongoose')
// parse automatic
app.use(express.json())

const reporterRouter = require('./routers/Reporter')
const newskRouter = require('./routers/News')
app.use(reporterRouter)
app.use(newskRouter)


app.listen(port, () => { console.log('Server is running ' + port) })