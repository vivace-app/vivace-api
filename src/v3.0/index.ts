import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import { CodeTable, LicenceTable, ScoreTable, UserTable, ErrorTable } from './dbManager'

const authRouter = express.Router()
const dateformat = require('dateformat')
const dbm = require('db-migrate').getInstance(true)
const router = express.Router()

dotenv.config() // Read env file
dbm.up() // Migrate database


// -----  LICENCE TABLE  -------------------------------------------------------

router.get('/licence', (req: express.Request, res: express.Response) => {
    LicenceTable.getAllLicence()
        .then(data => {
            res.json({
                success: true,
                version: data
            })
        })
        .catch(err => {
            ErrorTable.postErrorLog(null, 'LicenceTable.getAllLicence()', err)
            res.status(500).json({
                success: false,
                msg: 'Could not get from database'
            })
        })
})
// -----------------------------------------------------------------------------


// ---- User Registration ----
router.post('/register', (req: express.Request, res: express.Response) => {
    if (req.body.name) {
        UserTable.existUserCheck(req.body.name)
            .then(bool => {
                if (bool) {
                    res.status(500).json({
                        success: false,
                        msg: 'Duplicate user name'
                    })
                } else {
                    UserTable.register(req.body.name)
                    const now = new Date()
                    const payload = {
                        user: req.body.name,
                        created_at: dateformat(now, 'yyyy-mm-dd HH:MM:ss')
                    }
                    const token = jwt.sign(payload, process.env.APP_KEY as string)
                    res.json({
                        success: true,
                        msg: 'Successfully created account',
                        name: req.body.name,
                        token: token
                    })
                }
            })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Account registration failed'
        })
    }
})

// ---- Account Recovery ----
router.post('/recovery', (req: express.Request, res: express.Response) => {
    if (req.body.code) {
        CodeTable.getName(req.body.code)
            .then(name => {
                CodeTable.disableCode(name as string)
                    .then(row => {
                        const now = new Date()
                        const payload = {
                            user: name,
                            created_at: dateformat(now, 'yyyy-mm-dd HH:MM:ss')
                        }
                        const token = jwt.sign(payload, process.env.APP_KEY as string)
                        res.json({
                            success: true,
                            msg: 'Successfully created account',
                            user: name,
                            token: token
                        })
                    })
            })
            .catch(err => {
                res.status(500).json({
                    success: false,
                    msg: 'Invalid code'
                })
            })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Invalid code'
        })
    }
})

// ---- Get Top Score ----
router.post('/topScore', (req, res) => {
    if (req.body.music && req.body.level) {
        ScoreTable.topScore(req.body.music, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})

// ---- Get Top Ten Score ----
router.post('/topTenScore', (req, res) => {
    if (req.body.music && req.body.level) {
        ScoreTable.topTenScore(req.body.music, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})

// ====== JWT authentication required ==========================================

authRouter.use((req, res, next) => {
    var token = req.body.token
    if (!token) {
        return res.status(403).send({
            success: false,
            msg: 'No token provided'
        })
    }
    jwt.verify(token, process.env.APP_KEY as string, (err: any, decoded: any) => {
        if (err) {
            return res.json({
                success: false,
                msg: 'Invalid token'
            })
        }
        next()
    })
})

// ---- Update Last Login ----
authRouter.post('/updateLastLogin', (req, res) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    UserTable.updateLastLogin(decode.user)
        .then(row => {
            res.json({
                success: true,
                msg: 'Successfully updated last login'
            })
        })
})

// ---- Get My Score ----
authRouter.post('/myScore', (req, res) => {
    if (req.body.music && req.body.level) {
        const jwt = req.body.token.split('.')
        const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
        ScoreTable.myScore(req.body.music, req.body.level, decode.user)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})

// ---- Score Registration ----
authRouter.post('/registScore', (req, res) => {
    if (req.body.music && req.body.level && req.body.score) {
        const jwt = req.body.token.split('.')
        const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
        ScoreTable.register(req.body.music, req.body.level, req.body.score, decode.user)
        res.json({
            success: true,
            msg: 'Successfully registerd score'
        })
    } else {
        res.status(500).json({
            success: false,
            msg: 'Score registration failed'
        })
    }
})

// ---- Code Generation ----
authRouter.post('/issuingAccountCode', (req, res) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    CodeTable.disableCode(decode.user)
        .then(result => {
            CodeTable.codeIssuance(decode.user)
                .then(code => {
                    res.json({
                        success: true,
                        msg: 'Successfully created code',
                        code: code
                    })
                })
        })
})

// =============================================================================


router.use("/auth/", authRouter)

module.exports = router
