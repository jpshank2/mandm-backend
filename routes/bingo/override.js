const sql = require("mssql");

const config = {
    datawarehouse: {
        user: process.env.DV_DB_USER,
        password: process.env.DV_DB_PASS,
        server: process.env.DV_DB_SERVER,
        database: process.env.DV_DB_DB,
        options: {
            encrypt: true,
            enableArithAbort: true
        }
    },
    engine: {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_SERVER,
        database: process.env.DB_DB,
        options: {
            encrypt: true,
            enableArithAbort: true
        }
    }
}

const BASE = (req, res) => {
    const override = async () => {
        let missedUsers = []
        let pool = await sql.connect(config.datawarehouse)
        let data = await pool.request()
            .query(`SELECT BC.BingoUser, SUM(B.BingoMissed) AS Missed
            FROM dbo.Bingo B
            INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
            WHERE CONVERT(DATE, BingoDate) = CONVERT(DATE, GETDATE()) AND BingoNumber = 0
            GROUP BY BC.BingoUser`)
        
        missedUsers = data.recordset
        pool.close()
        return missedUsers
    }
    
    override()
        .then(result => {
            let results = []
            const getStaff = async (staff, returnArr) => {
                let pool = await sql.connect(config.engine)
                for (let i = 0; i < staff.length; i++) {
                    let data = await pool.request()
                        .input('staff', sql.Int, staff[i].BingoUser)
                        .query('SELECT StaffIndex, StaffName FROM dbo.tblStaff WHERE StaffIndex = @staff')
                    returnArr.push({StaffIndex: data.recordset[0].StaffIndex, StaffName: data.recordset[0].StaffName, BingoMissed: staff[i].BingoMissed})
                }
                pool.close()
                return returnArr
            }
            getStaff(result, results)
                .then(missedUsers => {
                    res.send(missedUsers)
                })
        })
        .catch(err => {
            console.log(`Bingo override Error:\n${err}`)
        })
}

module.exports = {
    BASE: BASE,
}