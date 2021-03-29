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
        request.query(`DECLARE @quarter int
        SET @quarter = (CASE WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 1, 1), CURRENT_TIMESTAMP) < 4 THEN 1 
                             WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 5, 1), CURRENT_TIMESTAMP) < 4 THEN 2
                             WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 9, 1), CURRENT_TIMESTAMP) < 4 THEN 3
                             ELSE 0 END)
        
        SELECT COALESCE(SUM(CASE WHEN EventAction = 'UPWARD' THEN 1
                            WHEN EventAction = 'DOWNWARD' THEN 1
                         WHEN EventAction = 'KUDOS' THEN 2
                         WHEN EventAction IN ('HR-LEADER', 'HR-STAFF') THEN 1
                         ELSE 0 END), 0) AS [Total]
               ,COALESCE(SUM(CASE WHEN EventAction = 'UPWARD' THEN 1 ELSE 0 END), 0) AS [ROLOUpward] 
               ,COALESCE(SUM(CASE WHEN EventAction = 'DOWNWARD' THEN 1 ELSE 0 END), 0) AS [ROLODownward] 
               ,COALESCE(SUM(CASE WHEN EventAction = 'KUDOS' THEN 2 ELSE 0 END), 0) AS [KUDOS]
               ,COALESCE(SUM(CASE WHEN EventAction IN ('HR-LEADER', 'HR-STAFF') THEN 1 ELSE 0 END), 0) AS [Homeroom]
               ,@quarter AS [Tetramester]
        FROM dbo.MandM
        WHERE EventUpdatedBy LIKE '${req.params.id}%'
        AND EventDate BETWEEN CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                        WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                        WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                        ELSE DATEFROMPARTS(YEAR(GETDATE()), 1, 1) END
AND CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                        WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                        WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
                        ELSE DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1) END;`, (err, recordset) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    res.send(recordset)
                                })
    })
}

module.exports = {
    BASE: BASE
}