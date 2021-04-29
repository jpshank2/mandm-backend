const nodemailer = require('nodemailer')
const sql = require('mssql')

let d = new Date()
d = d.toString().substring(4, 15)

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

let pooledTransporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EM_USER,
        pass: process.env.EM_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    maxMessages: 3,
    maxConnections: 3
})

let EMAIL = (info) => {
    pooledTransporter.sendMail({
        from: process.env.EM_USER,
        to: info.userEmail,
        bcc: `zealhr@bmss.com; ${info.senderEmail}`,
        subject: `Cornerstone KUDOS for ${info.name}`,
        html: `<h1 style="text-align: center">Cornerstone KUDOS</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>What Cornerstone was exhibited? </strong>${info.cornerstone}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><p style="text-align: center">${info.description}</p>`
    })
}

let UPWARD = (info) => {   
    const getHomeroomLeader = async (info) => {
        let recipientEmail = info.userEmail
        let pool = await sql.connect(config)
        let sqlQuery = `SELECT StaffEMail
                FROM dbo.tblStaff
                WHERE StaffName = (SELECT CatName
                FROM dbo.tblCategory H
                INNER JOIN tblStaffEx SE ON SE.StaffSubDepartment = H.Category AND H.CatType = 'SUBDEPT'
                INNER JOIN tblStaff S ON S.StaffIndex = SE.StaffIndex
                WHERE StaffEMail = @recipientEmail)`
        let data = await pool.request()
            .input('recipientEmail', sql.NVarChar, recipientEmail)
            .query(sqlQuery)
        let homeroomLeader 
        data.recordset.length > 0 ? data.recordset[0].StaffEMail : 'dmurphy@bmss.com'
        pool.close()
        return homeroomLeader
    }

    getHomeroomLeader(info)
        .then(result => {
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: result,
                bcc: info.senderEmail,
                subject: `ROLO - Upward for ${info.name}`,
                html: `<h1 style="text-align: center">ROLO - Upward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
            })
        })
        .catch(err => {
            console.log(`Upward ROLO Email Error:\n${err}\n${JSON.stringify(info)}`)
        })
}

let DOWNWARD = (info) => {
    const getHomeroomLeader = async (info) => {
        let recipientEmail = info.userEmail
        let pool = await sql.connect(config)
        let sqlQuery = `SELECT StaffEMail
                FROM dbo.tblStaff
                WHERE StaffName = (SELECT TOP 1 CatName
                FROM dbo.tblCategory H
                INNER JOIN tblStaffEx SE ON SE.StaffSubDepartment = H.Category AND H.CatType = 'SUBDEPT'
                INNER JOIN tblStaff S ON S.StaffIndex = SE.StaffIndex
                WHERE StaffEMail = @recipientEmail)`
        let data = await pool.request()
            .input('recipientEmail', sql.NVarChar, recipientEmail)
            .query(sqlQuery)
        let homeroomLeader = data.recordset.length > 0 ? data.recordset[0].StaffEMail : 1
        pool.close()
        return homeroomLeader
    }

    getHomeroomLeader(info)
        .then(result => {
            if (result !== 1) {
                pooledTransporter.sendMail({
                    from: process.env.EM_USER,
                    to: "zealhr@bmss.com",
                    cc: `${result}; ${info.userEmail}`,
                    bcc: info.senderEmail,
                    subject: `ROLO - Downward for ${info.name}`,
                    html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
                })
            } else {
                pooledTransporter.sendMail({
                    from: process.env.EM_USER,
                    to: "zealhr@bmss.com",
                    cc: `${info.userEmail}`,
                    bcc: info.senderEmail,
                    subject: `ROLO - Downward for ${info.name}`,
                    html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
                })
            }
        })
        .catch(err => {
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: `${info.userEmail}`,
                bcc: info.senderEmail,
                subject: `ROLO - Downward for ${info.name}`,
                html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
            })
            console.log(`Downard ROLO Email Error:\n${err}\n${JSON.stringify(info)}`)
        })
}

module.exports = {
    EMAIL: EMAIL,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
