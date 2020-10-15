import express from 'express'

const app: express.Express = express()
const dbm = require('db-migrate').getInstance(true)
const dotenv = require('dotenv').config()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router3_0: express.Router = require('./v3.0/')
const router3_1: express.Router = require('./v3.1/')

app.use('/v3.0/', router3_0)
app.use('/v3.1/', router3_1)

if (dotenv.parsed.TARGET_ENV == "development") {
    app.listen(3000, () => { console.log('[INFO] Listening on port 3000...') })
    dbm.up()
} else if (dotenv.parsed.TARGET_ENV == "production") {
    setTimeout(() => {
        require('greenlock-express')
            .init({
                packageRoot: __dirname + '/../',
                maintainerEmail: "developer_ikep@gmail.com",
                configDir: './greenlock.d',
                cluster: false
            })
            .serve(app);
        dbm.up()
    }, 30000)
}
