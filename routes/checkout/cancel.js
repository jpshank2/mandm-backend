const sql = require("mssql")
const nodemailer = require('nodemailer');

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

const BASE = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`DELETE FROM dbo.OpenOffices WHERE OfficeCode = ${req.body.code}`, (err, recordsets) => {
            if (err) {
                console.log(err)
                console.log("cancel.js BASE error")
            }
        })
    })
}

const CANCEL = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT [Name]
                    ,[OfficeCode]
                    ,S.StaffEMail
                    FROM [DataWarehouse].[dbo].[OpenOffices] O
                    INNER JOIN dbo.tblStaff S ON S.StaffIndex = O.EmployeeID
                    WHERE ID = ${req.params.id}`, (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("cancel.js CANCEL error")
            }
            transporter.sendMail({
                from: process.env.EM_USER,
                to: recordset.recordsets[0][0].StaffEMail,
                subject: `${recordset.recordsets[0][0].Name} Cancelation Code`,
                html: `<p>Please use the following code to cancel your selected office checkout.</p><br><p><strong>${recordset.recordsets[0][0].OfficeCode}</strong></p>`
            })
        })
    })
}

module.exports = {
    BASE: BASE,
    CANCEL: CANCEL
}