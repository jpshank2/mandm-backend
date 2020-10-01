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
                             
        DECLARE @goal int
        SET @goal = (SELECT CASE WHEN StaffCategory IN ('3', '6', '11', '12', '13', '14', '15', '17', '18') THEN 35
                                 WHEN StaffCategory IN ('2', '4', '5', '7', '8', '9', '10', '20') THEN 55
                                 WHEN StaffCategory = '1' THEN 65
                                 ELSE 0 END
                     FROM dbo.tblStaff WHERE StaffEMail LIKE '${req.params.id}%')
        
        SELECT @goal AS [Goal]
               ,COALESCE(SUM(CASE WHEN EventAction = 'UPWARD' THEN 1
                            WHEN EventAction = 'DOWNWARD' THEN 1
                         WHEN EventAction = 'BUDGET' THEN 1
                         WHEN EventAction = 'KUDOS' THEN 2
                         WHEN EventAction = 'VISIT' THEN 3
                         WHEN EventAction = 'OPEN' THEN 2
                         WHEN EventAction = 'MENTOR' THEN 2
                         WHEN EventAction IN ('HR-LEADER', 'HR-STAFF') THEN 1
                         WHEN EventAction = 'Fireside' THEN 1
                         WHEN EventAction = 'TEACH' THEN 3
                         WHEN EventAction = 'ATTEND' THEN 1
                         WHEN EventAction = 'EVENT' THEN 2
                         WHEN EventAction = 'INTVW' THEN 1
                         WHEN EventACtion ='RESUME' THEN 1
                         ELSE 0 END), 0) AS [Total]
               ,COALESCE(SUM(CASE WHEN EventAction = 'UPWARD' THEN 1 ELSE 0 END), 0) AS [ROLOUpward] 
               ,COALESCE(SUM(CASE WHEN EventAction = 'DOWNWARD' THEN 1 ELSE 0 END), 0) AS [ROLODownward] 
               ,COALESCE(SUM(CASE WHEN EventAction = 'BUDGET' THEN 1 ELSE 0 END), 0) AS [Budget]
               ,COALESCE(SUM(CASE WHEN EventAction = 'KUDOS' THEN 2 ELSE 0 END), 0) AS [KUDOS]
               ,COALESCE(SUM(CASE WHEN EventAction = 'VISIT' THEN 3 ELSE 0 END), 0) AS [VisitOffice]
               ,COALESCE(SUM(CASE WHEN EventAction = 'OPEN' THEN 2 ELSE 0 END), 0) AS [OpenArea]
               ,COALESCE(SUM(CASE WHEN EventAction = 'MENTOR' THEN 2 ELSE 0 END), 0) AS [MentorConvo]
               ,COALESCE(SUM(CASE WHEN EventAction IN ('HR-LEADER', 'HR-STAFF') THEN 1 ELSE 0 END), 0) AS [Homeroom]
               ,COALESCE(SUM(CASE WHEN EventAction = 'Fireside' THEN 1 ELSE 0 END), 0) AS [Fireside]
               ,COALESCE(SUM(CASE WHEN EventAction = 'TEACH' THEN 3 ELSE 0 END), 0) AS [Teach]
               ,COALESCE(SUM(CASE WHEN EventAction = 'ATTEND' THEN 1 ELSE 0 END), 0) AS [Attend]
               ,COALESCE(SUM(CASE WHEN EventAction = 'EVENT' THEN 2 ELSE 0 END), 0) AS [Recruit]
               ,COALESCE(SUM(CASE WHEN EventAction = 'INTVW' THEN 1 ELSE 0 END), 0) AS [TakeOut]
               ,COALESCE(SUM(CASE WHEN EventACtion ='RESUME' THEN 1 ELSE 0 END), 0) AS [Resume]
               ,@quarter AS [Tetramester]
        FROM dbo.MandM
        WHERE EventUpdatedBy LIKE '${req.params.id}%'
        AND EventDate >= CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 1, 1)
                                WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 5, 1)
                                WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 9, 1)
                                ELSE DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 1, 1) END
        AND EventDate < CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 5, 1)
                                WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 9, 1)
                                WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP) + 1, 1, 1)
                                ELSE DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP) + 1, 1, 1) END;`, (err, recordset) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        res.send(recordset)
                                    }
                                })
    })
}

module.exports = {
    BASE: BASE
}