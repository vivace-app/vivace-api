import express from 'express'

const app: express.Express = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router: express.Router = require('./v1/')

app.use('/api/v1/', router)

app.listen(3000, () => { console.log('Listening on port 3000...') })
