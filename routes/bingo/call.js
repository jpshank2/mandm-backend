const sql = require("mssql");
const CronJob = require('cron').CronJob
const SendMail = require("./sendmail.js")
const CheckWin = require("./checkwin.js")

const job = new CronJob(
    '00 45 16 * * 1-5', () => {
        CheckWin.BASE()
    },
    null,
    false,
    'America/Chicago'
)

job.start()

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

const BASE = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`SELECT DISTINCT BingoNumber
                        FROM dbo.Bingo
                        WHERE BingoCalled = 0`, (err, recordset) => {
                            if (err) {console.log(err); console.log("call.js base error")}
                            let selection = Math.floor(Math.random() * recordset.recordsets[0].length)
                            res.send(recordset.recordsets[0][selection])
                        })
                    })
}

const DATES = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`SELECT DISTINCT BingoDate, BingoNumber
        FROM dbo.Bingo
        WHERE BingoCalled = 1 AND BingoNumber != 0`, (err, recordset) => {
                            if (err) {console.log(err); console.log("call.js dates error")}
                            res.send(recordset.recordsets[0])
                        })
                    })
}

const POST = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`UPDATE dbo.Bingo
                        SET BingoCalled = 1, BingoDate = CONVERT(DATE, CURRENT_TIMESTAMP)
                        FROM dbo.Bingo B
                        WHERE BingoNumber = ${req.body.number}`, (err, recordset) => {
                            if (err) {
                                console.log(err)
                                console.log("call.js post error")
                            }
                            SendMail.EMAIL(req.body.number)
                        })
    })
}

const RESET = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`UPDATE dbo.Bingo
                        SET BingoCalled = 0, BingoDate = NULL, BingoMissed = 0
                        WHERE BingoNumber != 0
                        
                        UPDATE dbo.Bingo
                        SET BingoMissed = 0, BingoDate = NULL
                        WHERE BingoNumber = 0`, (err, recordset) => {
                            if (err) {
                                console.log(err);console.log("call.js reset error")
                            }
                        })
    })
}

module.exports = {
    BASE: BASE,
    DATES: DATES,
    POST: POST,
    RESET: RESET
}