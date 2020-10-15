const crypto = require('crypto')
const dateformat = require('dateformat')
const dotenv = require('dotenv').config()
const mysql = require('mysql')

const crypto_letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const crypto_count = 8
const pool = mysql.createPool({
    host: dotenv.parsed.MYSQL_HOST,
    user: dotenv.parsed.MYSQL_USER,
    password: dotenv.parsed.MYSQL_PASSWORD,
    database: dotenv.parsed.MYSQL_DATABASE
})

// =====  LICENSE TABLE  =======================================================

export class LicenseTable {
    static async getAllLicense() {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT version, expirationDate, url FROM license WHERE active = true", function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }
}
// =============================================================================


// =====  MUSIC TABLE  =========================================================

export class MusicTable {
    static async getAllMusic() {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT name, title, artist FROM music WHERE active = true", function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }

    static async getNotesData(id: number) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT easy, basic, hard, demon FROM music WHERE id = ? AND active = true", [id], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }
}
// =============================================================================


// =====  USER TABLE  ==========================================================

export class UserTable {
    static async existUserCheck(name: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT id FROM user WHERE name = ?", [name], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row.length)
                })
            })
        })
    }
    static async register(name: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("INSERT INTO user SET ?", { name: name, last_login: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), updated_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss') }, function (err: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve()
                })
            })
        })
    }
    static async updateLastLogin(name: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("UPDATE user SET last_login = ? WHERE name = ?", [dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), name], function (err: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve()
                })
            })
        })
    }
}
// =============================================================================


// =====  SCORE TABLE  =========================================================

export class ScoreTable {
    static async myScore(name: string, music: string, level: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT score FROM score WHERE name = ? AND music = ? AND level = ?  AND active = true ORDER BY score DESC LIMIT 1", [name, music, level], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }
    static async topScore(music: string, level: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT name, score FROM score WHERE music = ? AND level = ? AND active = true ORDER BY score DESC LIMIT 1", [music, level], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }
    static async topTenScore(music: string, level: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT name, score FROM score WHERE music = ? AND level = ? AND active = true ORDER BY score DESC LIMIT 10", [music, level], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row)
                })
            })
        })
    }
    static async register(name: string, music: string, level: string, score: number) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("INSERT INTO score SET ?", { name: name, music: music, level: level, score: score, created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), updated_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss') }, function (err: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve()
                })
            })
        })
    }
}
// =============================================================================


// =====  CODE TABLE  ==========================================================

export class CodeTable {
    static async getName(code: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT name FROM code WHERE code = ? AND active = true ORDER BY created_at DESC LIMIT 1", [code], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else if (!row[0])
                        return reject()
                    else
                        return resolve(row[0].name)
                })
            })
        })
    }
    static async disableCode(name: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("UPDATE code SET active = false, disabled_at = ? WHERE name = ? AND active = true", [dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), name], function (err: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve()
                })
            })
        })
    }
    static async existCodeCheck(code: string) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (error: any, connection: any) {
                if (error)
                    throw error
                connection.query("SELECT id FROM code WHERE code = ? AND active = true", [code], function (err: any, row: any) {
                    connection.release()
                    if (err)
                        return reject(err)
                    else
                        return resolve(row.length)
                })
            })
        })
    }
    static async codeIssuance(name: string) {
        return new Promise((resolve, reject) => {
            const code = Array.from(crypto.randomFillSync(new Uint8Array(crypto_count))).map((n: any) => crypto_letter[n % crypto_letter.length]).join('')
            CodeTable.existCodeCheck(code)
                .then(bool => {
                    if (bool) {
                        CodeTable.codeIssuance(name)
                            .then(code => {
                                return resolve(code)
                            })
                            .catch(err => {
                                return reject(err)
                            })
                    } else {
                        pool.getConnection(function (error: any, connection: any) {
                            if (error)
                                throw error
                            connection.query("INSERT INTO code SET ?", { name: name, code: code, active: true, created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), updated_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss') }, function (err: any) {
                                connection.release()
                                if (err)
                                    return reject(err)
                                else
                                    return resolve(code)
                            })
                        })
                    }
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }
}
// =============================================================================


// =====  ERROR TABLE  =========================================================

export class ErrorTable {
    static async postErrorLog(user: string | null, func: string, data: string) {
        pool.getConnection(function (error: any, connection: any) {
            if (error)
                throw error
            connection.query("INSERT INTO error SET ?", { user: user, function: func, data: data, created_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss'), updated_at: dateformat(Date.now(), 'yyyy-mm-dd HH:MM:ss') }), connection.release()
        })
    }
}
// =============================================================================
