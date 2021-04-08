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
    const overridePost = async (req) => {
        let pool = await sql.connect(devConfig)
        for (let i = 0; i < req.body.override.length; i++) {
            if (i === req.body.override.lastIndexOf(req.body.override[i])) {
                let data = await pool.request()
                    .input('staff', sql.Int, req.body.override[i])
                    .query(`DECLARE @card int
                    SET @card = (SELECT BingoCard FROM dbo.BingoCards WHERE BingoUser = @staff)
                    DECLARE @missed int
                    SET @missed = (SELECT BingoMissed FROM dbo.Bingo WHERE BingoCard = @card AND BingoNumber = 0)
                    
                    UPDATE dbo.Bingo
                    SET BingoDate = CONVERT(DATE, DATEADD(DAY, -1, BingoDate))
                    WHERE BingoCard = @card AND CONVERT(DATE, BingoDate) = CONVERT(DATE, GETDATE()) AND BingoNumber = 0
                    
                    UPDATE dbo.Bingo
                    SET BingoMissed = @missed - 1
                    WHERE BingoCard = @card`)
                console.log(data)
            }
        }
        pool.close()
        return true
    }

    overridePost(req)
        .then(() => {
            res.send('Thanks for overriding Bingo!')
        })
        .catch(err => {
            console.log(`Bingo overridePost Error:\n${err}`)
        })
}

module.exports = {
    POST: POST
}