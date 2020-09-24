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
        request.query(`SELECT [EventIndex]
        ,[EventDate]
        ,[EventPerson]
        ,[EventNotes]
        ,S.StaffName
    FROM [DataWarehouse].[dbo].[MandM] M
    INNER JOIN dbo.tblStaff S ON S.StaffIndex = M.EventStaff
    WHERE EventAction = 'KUDOS'
    AND EventNotes LIKE '${req.params.cornerstone}%'
    AND EventDate BETWEEN CONVERT(DATE, DATEADD(dd, -7, GETDATE())) AND CURRENT_TIMESTAMP
    ORDER BY EventDate DESC `, (err, recordset) => {
            if (err) {console.log(err);console.log("base random.js error")}
            if (recordset.recordsets[0].length > 0) {
                let randomIndex = Math.floor(Math.random() * recordset.recordsets[0].length)
                res.send(recordset.recordsets[0][randomIndex])
            } else {
                res.send({error: true})
            }
        })
    })
}

module.exports = {
    BASE: BASE
}