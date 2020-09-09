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
        request.query(`SELECT DISTINCT BingoNumber
                        FROM dbo.Bingo
                        WHERE BingoCalled !=1`, (err, recordset) => {
                            if (err) {console.log(err); console.log("call.js error")}
                            let selection = Math.floor(Math.random() * recordset.recordsets[0].length)
                            res.send(recordset.recordsets[0][selection])
                        })
                    })
}

module.exports = {
    BASE: BASE
}