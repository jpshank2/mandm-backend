const sql = require("mssql");

const devConfig = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

const POST = (req, res) => {
     
    sql.connect(devConfig, () => {
        req.body.override.forEach(person => {
            if (req.body.override.indexOf(person) === req.body.override.lastIndexOf(person)) {
                let request = new sql.Request()
                request.query(`DECLARE @card int
                            SET @card = (SELECT StaffBingo FROM dbo.tblStaff WHERE StaffIndex = ${person})
                            DECLARE @missed int
                            SET @missed = (SELECT BingoMissed FROM dbo.Bingo WHERE BingoCard = @card AND BingoNumber = 0)
                            
                            UPDATE dbo.Bingo
                            SET BingoDate = CONVERT(DATE, DATEADD(DAY, -1, BingoDate))
                            WHERE BingoCard = @card AND CONVERT(DATE, BingoDate) = CONVERT(DATE, GETDATE()) AND BingoNumber = 0
                            
                            UPDATE dbo.Bingo
                            SET BingoMissed = @missed - 1
                            WHERE BingoCard = @card`, (err, recordset) => {
                                if (err) {console.log(err);console.log("overridePost.js post error")}
                            })
            }
        })
    })
}

module.exports = {
    POST: POST
}