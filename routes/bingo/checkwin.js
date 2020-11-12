const sql = require("mssql");
const CheckWinFunction = require("./checkwinfunction.js")
const SendMail = require("./sendmail.js")

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

const BASE = () => {
    sql.connect(config, () => {
        let cardRequest = new sql.Request()
        cardRequest.query(`SELECT DISTINCT BingoCard
                        FROM dbo.Bingo`, (err, recordset) => {
                            if (err) {console.log(err); console.log("checkwin.js base cardRequest error")}

                            recordset.recordsets[0].forEach(card => {
                            let tilesRequest = new sql.Request()
                            tilesRequest.query(`DECLARE @missed int
                            SET @missed = (SELECT BingoMissed FROM dbo.Bingo WHERE BingoNumber = 0 AND BingoCard = ${card.BingoCard})
                            
                            SELECT BingoNumber, BingoPosition, S.StaffName,
                            CASE
                                WHEN @missed = 0 THEN 0
                                ELSE 1
                            END AS BingoMissed
                            FROM dbo.Bingo B
                            INNER JOIN dbo.tblStaff S ON B.BingoCard = S.StaffBingo
                            WHERE BingoCalled = 1 AND BingoMissed < 1 AND BingoCard = ${card.BingoCard} AND BingoDate > S.StaffStarted
                            ORDER BY BingoPosition`, (err, records) => {
                                                    if (err) {console.log(err); console.log("checkwin.js base tilesRequest error")}
                                                    if (CheckWinFunction.BASE(records.recordsets[0])) {
                                                        SendMail.WINNER(records.recordsets[0][0].StaffName)
                                                    }
                                                })
                                            })
        });
    })
}

module.exports = {
    BASE: BASE
}