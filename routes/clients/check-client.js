const sql = require("mssql")

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_DB,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

const CHECKCLIENT = (req, res) => {

    sql.close()
     
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT COUNT(*) AS [ClientsAssociated] FROM dbo.tblContacts C
        INNER JOIN dbo.tblEngagement E ON E.ContIndex = C.ContIndex AND E.ClientStatus <> 'LOST'
        WHERE C.ContEmail LIKE '%${req.body.email}%'`, (err, recordset) => {
            if (err) {
                console.log(err)
            }
            if (recordset.recordsets[0][0].ClientsAssociated > 0) {
                res.send(true)
            } else {
                res.send(false)
            }
        })
    })
}

const GETCLIENTLIST = (req, res) => {

    sql.close()
    
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT E.ClientCode, C.ContName, C.ContIndex FROM dbo.tblContacts C
        INNER JOIN dbo.tblEngagement E ON E.ContIndex = C.ContIndex AND E.ClientStatus <> 'LOST'
        WHERE C.ContEmail LIKE '%${req.body.email}%'`, (err, recordset) => {
            if (err) {
                console.log(err)
            }
            res.send(recordset.recordsets[0])
        })
    })
}

const GETCLIENTJOBS = (req, res) => {

    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT JH.Job_Idx, JH.Job_Name, P.StaffName, M.StaffName, TP.WorkStatusDesc
        FROM dbo.tblJob_Header JH
        INNER JOIN dbo.tblEngagement E ON E.ContIndex = JH.ContIndex
        INNER JOIN dbo.tblStaff P ON P.StaffIndex = JH.Job_Partner
        INNER JOIN dbo.tblStaff M ON M.StaffIndex = JH.Job_Manager
        INNER JOIN dbo.tblPortfolio_Job TP ON JH.Job_Idx = TP.Job_Idx        
        WHERE E.ContIndex = ${req.body.contIndex}`)
    })
}

module.exports = {
    BASE: CHECKCLIENT,
    SHOWCLIENTS: GETCLIENTLIST,
    SHOWSTATUS: GETCLIENTJOBS
}