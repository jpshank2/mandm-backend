const sql = require("mssql");

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
        request.query(`SELECT S.StaffIndex 
        ,BingoIndex
        ,S.StaffName
        ,BingoMissed
    FROM dbo.Bingo
    INNER JOIN dbo.tblStaff S ON S.StaffBingo = BingoCard
    WHERE CONVERT(DATE, BingoDate) = CONVERT(DATE, GETDATE()) AND BingoNumber = 0`, (err, recordset) => {
              if (err) {console.log(err); console.log("override.js base error")}
              res.send(recordset.recordsets[0])
          })
    })
}

module.exports = {
    BASE: BASE,
}