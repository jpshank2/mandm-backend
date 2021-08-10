const sql = require("mssql");
// const CronJob = require('cron').CronJob
const SendMail = require("./sendmail.js")

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

const BASE = (req, res) => {
    const getNumbers = async () => {
        let index = 0
        let pool = await sql.connect(config)
        let data = await pool.request()
            .query(`SELECT DISTINCT BingoNumber 
            FROM dbo.Bingo B
            INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
            WHERE BingoCalled = 0 AND BingoCompany = 'BMSS'`)
        index = Math.floor(Math.random() * data.recordset.length)
        console.log(index)

        let number = data.recordset[index]
        pool.close()
        return number
    }

    getNumbers()
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.log(`Bingo getNumber Error:\n${err}`)
        })
}

const DATES = (req, res) => {
    const getPreviousCalled = async () => {
        let called = []

        let pool = await sql.connect(config)
        let data = await pool.request()
            .query(`SELECT DISTINCT BingoDate, BingoNumber 
            FROM dbo.Bingo B
            INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
            WHERE BingoCalled = 1 AND BingoNumber != 0 AND BingoCompany = 'BMSS'`)
        called = data.recordset
        pool.close()
        return called
    }

    getPreviousCalled()
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.log(`Bingo getPreviouslyCalled Error:\n${err}`)
        })
}

const POST = (req, res) => {
    const updateCalledNumbers = async (req) => {
        let pool = await sql.connect(config)
        let data = await pool.request()
            .input('number', sql.Int, req.body.number)
            .query(`UPDATE dbo.Bingo SET BingoCalled = 1, BingoDate = CONVERT(DATE, CURRENT_TIMESTAMP) WHERE BingoNumber = @number AND BingoCard IN (SELECT BingoCard FROM dbo.BingoCards WHERE BingoCompany = 'BMSS')`)
        console.log(data)
        pool.close()
        return 1
    }

    updateCalledNumbers(req)
        .then(() => {
            SendMail.EMAIL(req.body.number)
        })
        .catch(err => {
            console.log(`Bingo updateCalledNumbers Error:\n${err}`)
        })
}

const RESET = (req, res) => {
    const resetGame = async () => {
        let pool = await sql.connect(config)
        let data = await pool.request()
            .query(`UPDATE dbo.Bingo SET BingoCalled = 0, BingoDate = NULL, BingoMissed = 0 WHERE BingoNumber != 0 AND BingoCard IN (SELECT BingoCard FROM dbo.BingoCards WHERE BingoCompany = 'BMSS')
                    UPDATE dbo.Bingo SET BingoMissed = 0, BingoDate = NULL WHERE BingoNumber = 0 AND BingoCard IN (SELECT BingoCard FROM dbo.BingoCards WHERE BingoCompany = 'BMSS')`)
        console.log(data)
        pool.close()
        return 1
    }

    resetGame()
        .catch(err => {
            console.log(`Bingo resetGame Error:\n${err}`)
        })
}

module.exports = {
    BASE: BASE,
    DATES: DATES,
    POST: POST,
    RESET: RESET
}