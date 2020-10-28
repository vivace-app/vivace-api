import express from 'express'
import jwt from 'jsonwebtoken'
import { CodeTable, LicenseTable, MusicTable, ScoreTable, UserTable, ErrorTable } from './dbManager'

const authRouter = express.Router()
const dateformat = require('dateformat')
const dotenv = require('dotenv').config()
const router = express.Router()


// -----  LICENSE  -------------------------------------------------------------

router.get('/license', (req: express.Request, res: express.Response) => {
    LicenseTable.getAllLicense()
        .then(data => {
            res.json({
                success: true,
                version: data
            })
        })
        .catch(err => {
            ErrorTable.postErrorLog(null, '[license] LicenseTable.getAllLicense()', err)
            res.status(500).json({
                success: false,
                msg: 'Could not get from database'
            })
        })
})


// -----  Music  ---------------------------------------------------------------

router.get('/downloadCheck', (req: express.Request, res: express.Response) => {
    MusicTable.downloadCheck()
        .then(data => {
            res.json({
                success: true,
                music: data
            })
        })
        .catch(err => {
            ErrorTable.postErrorLog(null, '[music] MusicTable.download()', err)
            res.status(500).json({
                success: false,
                msg: 'Could not get from database'
            })
        })
})


// -----  USER REGISTRATION  ---------------------------------------------------

router.post('/register', (req: express.Request, res: express.Response) => {
    if (typeof req.body.name !== 'undefined' && req.body.name.length) {
        UserTable.existUserCheck(req.body.name)
            .then(bool => {
                if (bool) {
                    res.status(500).json({
                        success: false,
                        msg: 'Duplicate user name'
                    })
                } else {
                    UserTable.register(req.body.name)
                        .then(() => {
                            const payload = {
                                user: req.body.name,
                                created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss')
                            }
                            const token = jwt.sign(payload, dotenv.parsed.APP_KEY as string)
                            res.json({
                                success: true,
                                msg: 'Successfully created account',
                                name: req.body.name,
                                token: token
                            })
                        })
                        .catch(err => {
                            ErrorTable.postErrorLog(req.body.name, '[register] UserTable.register()', err)
                            res.status(500).json({
                                success: false,
                                msg: 'Account registration failed'
                            })
                        })
                }
            })
            .catch(err => {
                ErrorTable.postErrorLog(req.body.name, '[register] UserTable.existUserCheck()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Account registration failed'
                })
            })
    } else {
        ErrorTable.postErrorLog(null, '[register] name isset check', req.body.name)
        res.status(500).json({
            success: false,
            msg: 'Account registration failed'
        })
    }
})


// -----  ACCOUNT RECOVERY  ---------------------------------------------------

router.post('/recovery', (req: express.Request, res: express.Response) => {
    if (typeof req.body.code !== 'undefined' && req.body.code.length) {
        CodeTable.getName(req.body.code)
            .then(name => {
                CodeTable.disableCode(name as string)
                    .then(() => {
                        const payload = {
                            user: name,
                            created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss')
                        }
                        const token = jwt.sign(payload, dotenv.parsed.APP_KEY as string)
                        res.json({
                            success: true,
                            msg: 'Successfully created account',
                            user: name,
                            token: token
                        })
                    })
                    .catch(err => {
                        ErrorTable.postErrorLog(null, '[recovery] CodeTable.disableCode()', err)
                        res.status(500).json({
                            success: false,
                            msg: 'Failed to communicate with the database'
                        })
                    })
            })
            .catch(err => {
                if (typeof err !== 'undefined' && err.length)
                    ErrorTable.postErrorLog(null, '[recovery] CodeTable.getName()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Invalid code'
                })
            })
    } else {
        ErrorTable.postErrorLog(null, '[recovery] code isset check', req.body.code)
        res.status(500).json({
            success: false,
            msg: 'Invalid code'
        })
    }
})


// -----  GET TOP SCORE  -------------------------------------------------------

router.post('/topScore', (req: express.Request, res: express.Response) => {
    if (typeof req.body.music !== 'undefined' && req.body.music.length && typeof req.body.level !== 'undefined' && req.body.level.length) {
        ScoreTable.topScore(req.body.music, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
            .catch(err => {
                ErrorTable.postErrorLog(null, '[topScore] ScoreTable.topScore()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Failed getting score'
                })
            })
    } else {
        ErrorTable.postErrorLog(null, '[topScore] music & level isset check', 'music=' + req.body.music + ', level=' + req.body.level)
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})


// -----  GET TOP TEN SCORE  ---------------------------------------------------

router.post('/topTenScore', (req: express.Request, res: express.Response) => {
    if (typeof req.body.music !== 'undefined' && req.body.music.length && typeof req.body.level !== 'undefined' && req.body.level.length) {
        ScoreTable.topTenScore(req.body.music, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
            .catch(err => {
                ErrorTable.postErrorLog(null, '[topTenScore] ScoreTable.topTenScore()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Failed getting score'
                })
            })
    } else {
        ErrorTable.postErrorLog(null, '[topTenScore] music & level isset check', 'music=' + req.body.music + ', level=' + req.body.level)
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})


// =============================================================================
// ====== JWT authentication required ===================================== ↓ ==
// =============================================================================

authRouter.use((req: express.Request, res: express.Response, next) => {
    var token = req.body.token
    if (!token) {
        return res.status(403).send({
            success: false,
            msg: 'No token provided'
        })
    }
    jwt.verify(token, dotenv.parsed.APP_KEY as string, (err: any) => {
        if (err) {
            return res.status(403).json({
                success: false,
                msg: 'Invalid token'
            })
        }
        next()
    })
})


// -----  UPDATE LAST LOGIN  ---------------------------------------------------

authRouter.post('/updateLastLogin', (req: express.Request, res: express.Response) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    UserTable.updateLastLogin(decode.user)
        .then(() => {
            res.json({
                success: true,
                msg: 'Successfully updated last login'
            })
        })
        .catch(err => {
            ErrorTable.postErrorLog(decode.user, '[updateLastLogin] UserTable.updateLastLogin()', err)
            res.status(500).json({
                success: false,
                msg: 'Could not update last login'
            })
        })
})


// -----  GET MY SCORE  --------------------------------------------------------

authRouter.post('/myScore', (req: express.Request, res: express.Response) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    if (typeof req.body.music !== 'undefined' && req.body.music.length && typeof req.body.level !== 'undefined' && req.body.level.length) {
        ScoreTable.myScore(decode.user, req.body.music, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
            .catch(err => {
                ErrorTable.postErrorLog(decode.user, '[myScore] ScoreTable.myScore()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Failed getting score'
                })
            })
    } else {
        ErrorTable.postErrorLog(decode.user, '[myScore] music & level isset check', 'music=' + req.body.music + ', level=' + req.body.level)
        res.status(500).json({
            success: false,
            msg: 'Failed getting score'
        })
    }
})


// -----  SCORE REGISTRATION  --------------------------------------------------

authRouter.post('/registScore', (req: express.Request, res: express.Response) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    if (typeof req.body.music !== 'undefined' && req.body.music.length && typeof req.body.level !== 'undefined' && req.body.level.length && typeof req.body.score !== 'undefined' && req.body.score.length) {
        ScoreTable.register(decode.user, req.body.music, req.body.level, req.body.score)
            .then(() => {
                res.json({
                    success: true,
                    msg: 'Successfully registerd score'
                })
            })
            .catch(err => {
                ErrorTable.postErrorLog(decode.user, '[registScore] ScoreTable.register()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Score registration failed'
                })
            })
    } else {
        ErrorTable.postErrorLog(decode.user, '[registScore] music & level & score isset check', 'music=' + req.body.music + ', level=' + req.body.level + ', score=' + req.body.score)
        res.status(500).json({
            success: false,
            msg: 'Score registration failed'
        })
    }
})


// -----  CODE GENERATION  -----------------------------------------------------

authRouter.post('/issuingAccountCode', (req: express.Request, res: express.Response) => {
    const jwt = req.body.token.split('.')
    const decode = JSON.parse(Buffer.from(jwt[1], 'base64').toString())
    CodeTable.disableCode(decode.user)
        .then(() => {
            CodeTable.codeIssuance(decode.user)
                .then(code => {
                    res.json({
                        success: true,
                        msg: 'Successfully created code',
                        code: code
                    })
                })
                .catch(err => {
                    ErrorTable.postErrorLog(decode.user, '[issuingAccountCode] CodeTable.codeIssuance()', err)
                    res.status(500).json({
                        success: false,
                        msg: 'Code generation failed'
                    })
                })
        })
        .catch(err => {
            ErrorTable.postErrorLog(decode.user, '[issuingAccountCode] CodeTable.disableCode()', err)
            res.status(500).json({
                success: false,
                msg: 'Code generation failed'
            })
        })
})


// -----  GET PLAY DATA  -------------------------------------------------------

authRouter.post('/getPlayData', (req: express.Request, res: express.Response) => {
    if (typeof req.body.id !== 'undefined' && req.body.id.length && typeof req.body.level !== 'undefined' && req.body.level.length) {
        MusicTable.getPlayData(req.body.id + 1, req.body.level)
            .then(data => {
                res.json({
                    success: true,
                    data: data
                })
            })
            .catch(err => {
                ErrorTable.postErrorLog(null, '[music] MusicTable.getPlayData()', err)
                res.status(500).json({
                    success: false,
                    msg: 'Could not get play data'
                })
            })
    } else {
        ErrorTable.postErrorLog(null, '[getPlayData] id & level isset check', 'id=' + req.body.id + ', level=' + req.body.level)
        res.status(500).json({
            success: false,
            msg: 'Could not get play data'
        })
    }
})


// =============================================================================
// ======================================================================== ↑ ==
// =============================================================================


router.use("/auth/", authRouter)

module.exports = router
