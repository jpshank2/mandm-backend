const sql = require('mssql')

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

//
// For Homeroom Leaders to log check-ins with members
//

let POST = (req, checked) => {
    
    sql.on("error", err => {
        console.log(err)
    })

    sql.connect(config, () => {
        checked.forEach(member => {
            let name = member.name
            let patt = /.'/g
            if (patt.test(name)) {
                name = name.replace("'", "''")
            }
            let request = new sql.Request()
            request.query(`DECLARE @staffIndex int
                        SET @staffIndex = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                        INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy, EventRating)
                        VALUES (CURRENT_TIMESTAMP, '${name}', 'M+M', 'RELATE', 'HR-LEADER', 'Checked in with Homeroom Member', @staffIndex, '${req.body.senderEmail}', ${member.rating});`, 
                        (err, recordset) => {
                            if (err) {
                                console.log(err)
                                console.log(req.body)
                            }
                        })
        })
    })
}

//
// For Homeroom members to log check-ins with leaders
//

let MPOST = (req) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staffIndex int
            SET @staffIndex = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEMail = '${req.body.senderEmail}')
            DECLARE @hrnum int
            SET @hrnum = (SELECT StaffAttribute FROM dbo.tblStaff WHERE StaffEMail = '${req.body.senderEmail}')
            DECLARE @leader nvarchar(255)
            SET @leader= (SELECT StaffName FROM dbo.tblStaff WHERE StaffIndex = (SELECT StaffIndex FROM dbo.MandMLeaders WHERE Category = @hrnum))
            INSERT INTO dbo.MandM(EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
            VALUES (CURRENT_TIMESTAMP, @leader, 'M+M', 'RELATE', 'HR-STAFF', 'Homeroom Leader Check In', @staffIndex, '${req.body.senderEmail}')`, 
            (err, recordset) => {
                if (err) {
                    console.log(err)
                    console.log(req.body)
                }
            })
    })
}

//
// Testing Homeroom members logging check-ins with 'no' conditional option
//

let TMEMPOST = (req) => {
    if (req.body.memberChecked === 1) {
        sql.connect(config, () => {
            let request = new sql.Request()
            request.query(`DECLARE @staffIndex int
                SET @staffIndex = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEMail = '${req.body.senderEmail}')
                DECLARE @hrnum int
                SET @hrnum = (SELECT StaffAttribute FROM dbo.tblStaff WHERE StaffEMail = '${req.body.senderEmail}')
                DECLARE @leader nvarchar(255)
                SET @leader= (SELECT StaffName FROM dbo.tblStaff WHERE StaffIndex = (SELECT StaffIndex FROM dbo.MandMLeaders WHERE Category = @hrnum))
                INSERT INTO dbo.MandM(EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                VALUES (CURRENT_TIMESTAMP, @leader, 'M+M', 'RELATE', 'HR-STAFF', 'Homeroom Leader Check In', @staffIndex, '${req.body.senderEmail}')`, 
                (err, recordset) => {
                    if (err) {
                        console.log(err)
                        console.log(req.body)
                    }
                })
        })
    }
}

module.exports = {
    POST: POST,
    MPOST: MPOST,
    TMEMPOST: TMEMPOST
}