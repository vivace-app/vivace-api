import express from 'express'
import jwt from 'jsonwebtoken'
import { CommonDB, UserTable } from './DBManager'

// const app = express();
// const jwt = require("jsonwebtoken")
const router: express.Router = express.Router()

CommonDB.createTableIfNotExists()

router.post('/register', (req: express.Request, res: express.Response) => {
    if (req.body.name) {
        UserTable.existUserCheck(req.body.name)
            .then(bool => {
                if (bool) {
                    res.status(500).send('duplicate')
                } else {
                    UserTable.register(req.body.name)
                    res.send('success')
                }
            })
    } else {
        res.status(500).send('failure')
    }
})

const apiRoutes = express.Router()
// クライアントから送られたIDとパスワード確認してtoken（jwt）発行
// "/api/authenticate"
apiRoutes.post("/authenticate", (req, res) => {
    const payload = {
        user: "ikep"
    };
    const token = jwt.sign(payload, "123456");
    res.json({
        success: true,
        msg: "Authentication successfully finished",
        token: token
    });

    // IDとパスワードが正しくなかった場合
    // res.json({
    //     success: false,
    //     msg: "Authentication failed"
    // });
});

// 一度クライアントに返したtokenが改ざんされずにクライアントから送られてきたか確認
apiRoutes.use((req, res, next) => {
    var token = req.body.token;
    // tokenがない場合、アクセスを拒否
    if (!token) {
        return res.status(403).send({
            success: false,
            msg: "No token provided"
        });
    }
    // tokenが改ざんされていないかチェック
    jwt.verify(token, "123456", (err: any, decoded: any) => {
        // tokenが不正なものだった場合、アクセス拒否
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                msg: "Invalid token"
            });
        }
        // 正しいtokenの場合、認証OKする
        // req.decoded;
        next();
    });
});

// 認証後、これ以降のURIにアクセス可能となる
// "/api/private"
apiRoutes.get("/private", (req, res) => {
    res.json({
        msg: "Hello world!"
    });
});

router.use("/api/", apiRoutes);

module.exports = router
