const sql = require("mssql");
const PE    = require("./peapis.js")

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
    const getDashboardPoints = async () => {
        let token = await PE.getToken()
        let staff = await PE.getMyIndex(req.body.userName, token)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let pointsPool = await pool.connect()
        let data = await pointsPool.request()
            .input('staffIndex', sql.Int, staff.StaffIndex)
            .query(`DECLARE @quarter int
            SET @quarter = (CASE WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 1, 1), CURRENT_TIMESTAMP) < 4 THEN 1 
                        WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 5, 1), CURRENT_TIMESTAMP) < 4 THEN 2
                        WHEN DATEDIFF(month, DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP), 9, 1), CURRENT_TIMESTAMP) < 4 THEN 3
                        ELSE 0 END)
            
            DECLARE @filteredHomeroom int
            SET @filteredHomeroom = (SELECT CASE WHEN COALESCE(SUM(CASE WHEN SubType IN (3, 4) THEN 1 ELSE 0 END), 0) > 16 THEN 16 
                        ELSE COALESCE(SUM(CASE WHEN SubType IN (3, 4) THEN 1 ELSE 0 END), 0) END 
                        FROM MandM.Submissions WHERE SubSender = @staffIndex AND SubDate BETWEEN CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()), 1, 1) END
            AND CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1) END)
            
            DECLARE @filteredKudos int
            SET @filteredKudos =  (SELECT CASE WHEN COALESCE(SUM(CASE WHEN SubType = 5 THEN 2 ELSE 0 END), 0) > 12 THEN 12
                        ELSE COALESCE(SUM(CASE WHEN SubType = 5 THEN 2 ELSE 0 END), 0) END 
                        FROM MandM.Submissions WHERE SubSender = @staffIndex AND SubDate BETWEEN CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()), 1, 1) END
            AND CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1) END)
                                        
            SELECT COALESCE(SUM(CASE WHEN SubType IN (1, 2, 3, 4) THEN 1
                    WHEN SubType = 5 THEN 2
                    ELSE 0 END), 0) AS [Total]
            ,COALESCE((SUM(CASE WHEN SubType IN (1, 2) THEN 1 ELSE 0 END) + @filteredHomeroom + @filteredKudos), 0) AS [FilteredTotal] 
            ,COALESCE(SUM(CASE WHEN SubType = 1 THEN 1 ELSE 0 END), 0) AS [ROLOUpward] 
            ,COALESCE(SUM(CASE WHEN SubType = 2 THEN 1 ELSE 0 END), 0) AS [ROLODownward] 
            ,COALESCE(SUM(CASE WHEN SubType = 5 THEN 2 ELSE 0 END), 0) AS [KUDOS]
            ,COALESCE(SUM(CASE WHEN SubType IN (3, 4) THEN 1 ELSE 0 END), 0) AS [Homeroom]
            ,@quarter AS [Tetramester]
            FROM MandM.Submissions
            WHERE SubSender = @staffIndex
            AND SubDate BETWEEN CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()), 1, 1) END
            AND CASE WHEN @quarter = 1 THEN DATEFROMPARTS(YEAR(GETDATE()), 5, 1)
                    WHEN @quarter = 2 THEN DATEFROMPARTS(YEAR(GETDATE()), 9, 1)
                    WHEN @quarter = 3 THEN DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
                    ELSE DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1) END;`)
        let points = data.recordset
        pool.close()
        return points
    }

    getDashboardPoints()
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.log(`M+M getDashboardPoints Error:\n${err}`)
        })
}

module.exports = {
    dashboard: BASE
}
