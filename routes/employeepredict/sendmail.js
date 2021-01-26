const nodemailer = require('nodemailer')
const sql = require('mssql')

let d = new Date()
d = d.toString().substring(4, 15)

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
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
    transporter.sendMail({
        from: process.env.EM_USER,
        to: info.userEmail,
        bcc: `hgeary@bmss.com, ${info.senderEmail}`,
        //["bshealy@bmss.com", "hrussell@bmss.com", info.senderEmail],
        subject: `Cornerstone KUDOS for ${info.name}`,
        html: `<h1 style="text-align: center">Cornerstone KUDOS</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>What Cornerstone was exhibited? </strong>${info.cornerstone}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><p style="text-align: center">${info.description}</p>`
    })
}

let UPWARD = (info) => {

    let name = info.name
    let patt = /.'/g
    if (patt.test(name)) {
        name = name.replace("'", "''")
    }
     
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staff int
        SET @staff = (SELECT StaffIndex FROM dbo.MandMLeaders WHERE Category = (SELECT StaffAttribute FROM dbo.tblStaff WHERE StaffName = '${name}'))
        
        SELECT StaffEMail
        FROM [DataWarehouse].[dbo].[tblStaff]
        WHERE StaffIndex = @staff`, (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("employeepredict/sendmail.js upward error")
            }
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: recordset.recordsets[0][0].StaffEMail,
                bcc: info.senderEmail,
                subject: `ROLO - Upward for ${info.name}`,
                html: `<h1 style="text-align: center">ROLO - Upward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
            })
          })
        })
}

let DOWNWARD = (info) => {

    let name = info.name
    let patt = /.'/g
    if (patt.test(name)) {
        name = name.replace("'", "''")
    }
     
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staff int
        SET @staff = (SELECT StaffIndex FROM dbo.MandMLeaders WHERE Category = (SELECT StaffAttribute FROM dbo.tblStaff WHERE StaffName = '${name}'))
        
        SELECT StaffEMail
        FROM [DataWarehouse].[dbo].[tblStaff]
        WHERE StaffIndex = @staff`, (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("employeepredict/sendmail.js downward error")
            }

            //console.log(recordset.recordsets[0].length > 0 ? recordset.recordsets[0][0].StaffEMail : 'nothing')
            if (recordset.recordsets[0].length > 0) {
                transporter.sendMail({
                    from: process.env.EM_USER,
                    to: "zealhr@bmss.com",
                    cc: `${recordset.recordsets[0][0].StaffEMail}, ${info.userEmail}`,
                    bcc: info.senderEmail,
                    subject: `ROLO - Downward for ${info.name}`,
                    html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Cornerstone Exhibited: </strong>${info.cornerstone}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
                })
            } else {
                transporter.sendMail({
                    from: process.env.EM_USER,
                    to: "zealhr@bmss.com",
                    cc: `${info.userEmail}`,
                    bcc: info.senderEmail,
                    subject: `ROLO - Downward for ${info.name}`,
                    html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
                })
            }
        })
    })
}

module.exports = {
    EMAIL: EMAIL,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}