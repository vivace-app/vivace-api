import express from 'express'

const app: express.Express = express()
const dbm = require('db-migrate').getInstance(true)

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router3_0: express.Router = require('./v3.0/')

app.use('/v3.0/', router3_0)

setTimeout(() => {
    app.listen(3000, () => { console.log('[INFO] Listening on port 3000...') })
    dbm.up()
}, 30000)
