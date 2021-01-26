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

const REQUEST = (req, res) => {

    console.log(req.body)

    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staff int
            SET @staff = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${req.body.senderEmail}')
            INSERT INTO dbo.MandM (EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
            VALUES (CURRENT_TIMESTAMP, '${req.body.name}','M+M', 'FEEDBACK', 'REQUEST', 'Requesting ROLO for ${req.body.project} Project', @staff, '${req.body.senderEmail}')`, (err, recordset) => {
                if (err) {
                    console.log(err)
                }
                MMSendMail.REQUEST(req.body)
                res.send('success')
            })
    })

}

module.exports = {
    BASE: REQUEST
}