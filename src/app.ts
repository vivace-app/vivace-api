import express from 'express'

const app: express.Express = express()
const dbm = require('db-migrate').getInstance(true)
// const dotenv = require('dotenv').config()
require('dotenv').config();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router3_3: express.Router = require('./v3.3/')

app.use('/v3.3/', router3_3)

if (process.env.NODE_ENV == "development") {
    app.listen(3000, () => { console.log('[INFO] Listening on port 3000...') })
    dbm.up()
} else if (process.env.NODE_ENV == "test") {
    app.listen(80, () => { console.log('[INFO] Listening on port 80...') })
    dbm.up()
} else if (process.env.NODE_ENV == "production") {
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
