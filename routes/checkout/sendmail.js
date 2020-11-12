const nodemailer = require('nodemailer');
const ical       = require('ical-generator');
const sql = require("mssql")

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EM_USER,
        pass: process.env.EM_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

let EMAIL = (info) => {
    let content = ical({
        domain: 'bmss.com',
        events: [
            {
                start: new Date(info.checkedOut),
                end: new Date(info.checkedIn),
                summary: `${info.name} Check Out Information`,
                htmlDescription: `<p>${info.location} - click <a href="${info.image}">here</a> for an office location map.</p>`,
                location: info.name,
                busystatus: 'free',
                transparency: 'transparent'
            }
        ]
    }).toString();

    transporter.sendMail({
        from: process.env.EM_USER,
        to: info.email,
        subject: `${info.name} Check Out Information`,
        text: 'Please see the attached appointment',
        icalEvent: {
            method: 'PUBLISH',
            content: content
        }
    })
}

const CANCEL = (info) => {
    sql.close()
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT [Name]
        --,[OfficeCode]
        ,S.StaffEMail
    FROM [DataWarehouse].[dbo].[OpenOffices] O
    INNER JOIN dbo.tblStaff S ON S.StaffIndex = O.EmployeeID
    WHERE ID = ${info.code}`, (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("cancel.js CANCEL error")
            }
            transporter.sendMail({
                from: process.env.EM_USER,
                to: 'jeremyshank@bmss.com',//recordset.recordsets[0][0].StaffEMail,
                subject: `${info.name} Cancelation Code`,
                html: `<p>Please use the following code to cancel your selected office checkout.</p><br><p><strong>test</strong></p>`
            })
        })
    })
}

module.exports = {
    EMAIL: EMAIL,
    CANCEL: CANCEL
}