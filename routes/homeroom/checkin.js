const sql = require('mssql')

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

//
// For Homeroom Leaders to log check-ins with members
//

let POST = (req, checked) => {
    const postCheckIn = async () => {
        let index = await getStaffInfo(req.body.senderEmail)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let postPool = await pool.connect()
        for (let i = 0; i < checked.length; i++) {
            let member = checked[i].name
            let patt = /'/g
            member = member.replace(patt, "''")
            await postPool.request()
                .input('memberName', sql.NVarChar, member)
                .input('leaderEmail', sql.NVarChar, req.body.senderEmail)
                .input('leaderIndex', sql.NVarChar, index.StaffIndex)
                .input('memberRating', sql.Int, checked[i].rating)
                .query(`INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy, EventRating)
                VALUES (CURRENT_TIMESTAMP, @memberName, 'M+M', 'RELATE', 'HR-LEADER', 'Checked in with Homeroom Member', @leaderIndex, @leaderEmail, @memberRating);`)
        }
        pool.close()
        return true
    }
    postCheckIn()
        .catch(err => {
            console.log(`Homeroom Check-in postCheckIn Error:\n${err}`)
        })
}

//
// For Homeroom members to log check-ins with leaders
//

let MPOST = (req) => {
    const postMemberCheckIn = async () => {
        let staffInfo = await getStaffInfo(req.body.senderEmail)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let checkInPool = await pool.connect()
        await checkInPool.request()
            .input('leaderName', sql.NVarChar, staffInfo.CatName)
            .input('senderEmail', sql.NVarChar, req.body.senderEmail)
            .input('senderIndex', sql.Int, staffInfo.StaffIndex)
            .query(`INSERT INTO dbo.MandM(EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
            VALUES (CURRENT_TIMESTAMP, @leaderName, 'M+M', 'RELATE', 'HR-STAFF', 'Homeroom Leader Check In', @senderIndex, @senderEmail)`)
        pool.close()
        return true
    }

    postMemberCheckIn()
        .catch(err => {
            console.log(`Member Check-in postMemberCheckIn Error:\n${err}`)
        })
}

module.exports = {
    POST: POST,
    MPOST: MPOST
}