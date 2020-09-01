const sql = require("mssql");
const MMSendMail = require("./sendmail.js")

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

const POST = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request()
        let patt = /.'/g
        if (patt.test(req.body.notes)) {
            req.body.notes = req.body.notes.replace("'", "''")
        }
        if (patt.test(req.body.name)) {
            req.body.name = req.body.name.replace("'", "''")
        }
        switch(req.body.option) {
            case 0:
                //provided a resume to hr
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RECRUIT', 'RESUME', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RECRUIT(req.body)
                        }
                    })
                break;
            case 1:
                //provided a budget
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'FEEDBACK', 'BUDGET', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.FEEDBACK(req.body)
                        }
                    })
                break;
            case 2:
                //visited another office
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RELATE', 'VISIT', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RELATE(req.body)
                        }
                    })
                break;
            case 3:
                //open workspace
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RELATE', 'OPEN', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RELATE(req.body)
                        }
                    })
                break;
            case 4:
                //mentoring
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    DECLARE @mentor int
                    SET @mentor = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffName = '${req.body.name}')
                    DECLARE @email nvarchar(256)
                    SET @email = (SELECT StaffEMail FROM [dbo].[tblStaff] WHERE StaffName = '${req.body.name}')
                    INSERT INTO dbo.MandM (EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, '${req.body.name}','M+M', 'RELATE', 'MENTOR', '${req.body.notes}', @staff, '${req.body.senderEmail}'),
                            (CURRENT_TIMESTAMP, '${req.body.senderName}','M+M', 'RELATE', 'MENTOR', '${req.body.notes}', @mentor, @email)`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RELATE(req.body)
                        }
                    })
                break;
            case 5:
                //fireside
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RELATE', 'Fireside', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RELATE(req.body)
                        }
                    })
                break;
            case 6:
                //taught training
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'EDUCATE', 'TEACH', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.EDUCATE(req.body)
                        }
                    })
                break;
            case 7:
                //attend training
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'EDUCATE', 'ATTEND', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.EDUCATE(req.body)
                        }
                    })
                break;
            case 8:
                //recruiting
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RECRUIT', 'EVENT', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RECRUIT(req.body)
                        }
                    })
                break;
            case 9:
                //took candidate out
                request.query(`DECLARE @staff int
                    SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
                    INSERT INTO dbo.MandM (EventDate, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, 'M+M', 'RECRUIT', 'INTVW', '${req.body.notes}', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log(req.body)
                        } else {
                            MMSendMail.RECRUIT(req.body)
                        }
                    })
                break;
            default:
                console.log("submitted with nothing")
        }
    })
}

module.exports = {
    POST: POST
}