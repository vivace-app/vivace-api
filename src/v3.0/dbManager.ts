const sqlite = require('sqlite3').verbose()
const crypto = require('crypto')
const db = new sqlite.Database('gamedata.sqlite')
const dateformat = require('dateformat')

const CRYPTO_LETTER = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const CRYPTO_COUNT = 8

export class CommonDB {
    static async createTableIfNotExists() {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), created_at DATETIME, last_login DATETIME)')
            db.run('CREATE TABLE IF NOT EXISTS issue_code (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), code VARCHAR(20), active BOOLEAN, created_at DATETIME, disabled_at DATETIME)')
            db.run('CREATE TABLE IF NOT EXISTS score (id INTEGER PRIMARY KEY AUTOINCREMENT, music VARCHAR(40), name VARCHAR(20), level VARCHAR(10), score INT, created_at DATETIME)')
        })
    }
}

export class UserTable {
    static async existUserCheck(name: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                db.all(`SELECT id FROM user WHERE name = "${name}"`, (error: any, row: any) => {
                    return resolve(row[0] !== undefined)
                })
            })
        })
    }
    static async register(name: string) {
        const now = new Date()
        db.serialize(() => {
            const stmt = db.prepare(`INSERT INTO user (name, created_at, last_login) VALUES (?, ?, ?)`)
            stmt.run([name, dateformat(now, 'yyyy-mm-dd HH:MM:ss'), dateformat(now, 'yyyy-mm-dd HH:MM:ss')])
            stmt.finalize()
        })
    }
    static async updateLastLogin(name: string) {
        const now = new Date()
        return new Promise((resolve) => {
            db.serialize(() => {
                const now = new Date()
                db.run('UPDATE user SET last_login = $now WHERE name = $name', {
                    $now: dateformat(now, 'yyyy-mm-dd HH:MM:ss'),
                    $name: name
                })
                return resolve('done')
            })
        })
    }
}

export class ScoreTable {
    static async myScore(music: string, level: string, name: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                db.all(`SELECT score FROM score WHERE music = "${music}" AND level = "${level}" AND name = "${name}" ORDER BY score DESC LIMIT 1`, (error: any, row: any) => {
                    return resolve(row)
                })
            })
        })
    }
    static async topScore(music: string, level: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                db.all(`SELECT name,score FROM score WHERE music = "${music}" AND level = "${level}" ORDER BY score DESC LIMIT 1`, (error: any, row: any) => {
                    return resolve(row)
                })
            })
        })
    }
    static async topTenScore(music: string, level: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                db.all(`SELECT name,score FROM score WHERE music = "${music}" AND level = "${level}" ORDER BY score DESC LIMIT 10`, (error: any, row: any) => {
                    return resolve(row)
                })
            })
        })
    }
    static async register(music: string, level: string, score: number, name: string) {
        const now = new Date()
        db.serialize(() => {
            const stmt = db.prepare(`INSERT INTO score (music, name, level, score, created_at) VALUES (?, ?, ?, ?, ?)`)
            stmt.run([music, name, level, score, dateformat(now, 'yyyy-mm-dd HH:MM:ss')])
            stmt.finalize()
        })
    }
}

export class CodeIssuance {
    static async existCodeCheck(code: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                db.all(`SELECT id FROM issue_code WHERE code = "${code}" AND active = true`, (error: any, row: any) => {
                    return resolve(row[0] !== undefined)
                })
            })
        })
    }
    static async disableCode(name: string) {
        return new Promise((resolve) => {
            db.serialize(() => {
                const now = new Date()
                db.run('UPDATE issue_code SET active = false, disabled_at = $now WHERE name = $name AND active = true', {
                    $now: dateformat(now, 'yyyy-mm-dd HH:MM:ss'),
                    $name: name
                })
                return resolve('done')
            })
        })
    }
    static async codeIssuance(name: string) {
        return new Promise((resolve) => {

            const code = Array.from(crypto.randomFillSync(new Uint8Array(CRYPTO_COUNT))).map((n: any) => CRYPTO_LETTER[n % CRYPTO_LETTER.length]).join('')

            CodeIssuance.existCodeCheck(code)
                .then(bool => {
                    if (bool) {
                        CodeIssuance.codeIssuance(name)
                            .then(code => {
                                return resolve(code)
                            })
                    } else {
                        const now = new Date()
                        db.serialize(() => {
                            const stmt = db.prepare(`INSERT INTO issue_code (code, name, active, created_at) VALUES (?, ?, ?, ?)`)
                            stmt.run([code, name, true, dateformat(now, 'yyyy-mm-dd HH:MM:ss')])
                            stmt.finalize()
                        })
                        return resolve(code)
                    }
                })
        })
    }
    static async getName(code: string) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT name FROM issue_code WHERE code = "${code}" AND active = true`, (error: any, row: any) => {
                    if (row[0])
                        return resolve(row[0].name)
                    else
                        return reject("error")
                })
            })
        })
    }
}
