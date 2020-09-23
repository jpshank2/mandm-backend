const sql = require("mssql");
const SendMail = require("./sendmail.js")
const CheckWin = require("./checkwin.js")


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
                        WHERE BingoCalled !=1`, (err, recordset) => {
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
                        WHERE BingoDate IS NOT NULL`, (err, recordset) => {
                            if (err) {console.log(err); console.log("call.js dates error")}
                            res.send(recordset.recordsets[0])
                        })
                    })
}

const POST = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`UPDATE dbo.Bingo
                        SET BingoCalled = 1, BingoDate = CURRENT_TIMESTAMP
                        WHERE BingoNumber = ${req.body.number}`, (err, recordset) => {
                            if (err) {
                                console.log(err)
                                console.log("call.js post error")
                            }
                            SendMail.EMAIL(req.body.number)
                            setTimeout(() => {
                                CheckWin.BASE()
                            }, 10000)
                        })
    })
}

const RESET = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`UPDATE dbo.Bingo
                        SET BingoCalled = 0, BingoDate = NULL, BingoMissed = 0
                        WHERE BingoNumber != 0`, (err, recordset) => {
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