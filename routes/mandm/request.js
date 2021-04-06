const sql = require("mssql");
const MMSendMail = require("./sendmail.js")

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

const getStaffInfo = async (email) => {
    let pool = new sql.ConnectionPool(config.engine)
    let indexPool = await pool.connect()
    let data = await indexPool.request()
        .input('staff', sql.NVarChar, email)
        .query(`SELECT S.StaffIndex, H.CatName
        FROM dbo.tblStaff S
        INNER JOIN tblStaffEx SE ON SE.StaffIndex = S.StaffIndex
        INNER JOIN dbo.tblCategory H ON SE.StaffSubDepartment = H.Category AND H.CatType = 'SUBDEPT' WHERE StaffEMail = @staff`)
    let staffInfo = data.recordset[0]
    pool.close()
    return staffInfo
}

const REQUEST = (req, res) => {
    const requestROLO = async (req) => {
        let patt = /.'/g
        let name = req.body.name
        if (patt.test(name)) {
            name = name.replace(patt, "''")
        }

        let project = req.body.project
        if (patt.test(project)) {
            project = project.replace(patt, "''")
        }
        let staff = await getStaffInfo(req.body.senderEmail)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let requestPool = await pool.connect()
        await requestPool.request()
            .input('requestedName', sql.NVarChar, name)
            .input('project', sql.NVarChar, project)
            .input('senderIndex', sql.Int, staff.StaffIndex)
            .input('senderEmail', sql.NVarChar, req.body.senderEmail)
            .query(`INSERT INTO dbo.MandM (EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                VALUES (CURRENT_TIMESTAMP, 
                        @requestedName,
                        'M+M', 
                        'FEEDBACK', 
                        'REQUEST', 
                        CONCAT('Requesting ROLO for ', @project, ' Project'), 
                        @senderIndex, 
                        @senderEmail)`)
        pool.close()
        return true
    }

    requestROLO(req)
        .then(() => {
            res.send('Thanks for sending a ROLO Request')
            MMSendMail.REQUEST(req.body)
        })
        .catch(err => {
            console.log(`M+M requestROLO Error:\n${err}`)
        })
}

module.exports = {
    BASE: REQUEST
}