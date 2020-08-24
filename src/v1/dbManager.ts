const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('gamedata.sqlite')
const dateformat = require('dateformat')

export class CommonDB {
    static async createTableIfNotExists() {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), created_at DATETIME, last_login DATETIME)')
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
}
