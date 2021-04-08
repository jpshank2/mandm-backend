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
        bcc: `hgeary@bmss.com; ${info.senderEmail}`,
        //["bshealy@bmss.com", "hrussell@bmss.com", info.senderEmail],
        subject: `Cornerstone KUDOS for ${info.name}`,
        html: `<h1 style="text-align: center">Cornerstone KUDOS</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>What Cornerstone was exhibited? </strong>${info.cornerstone}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><p style="text-align: center">${info.description}</p>`
    })
}

let UPWARD = (info) => {   
    const getHomeroomLeader = async (info) => {
        let recipientEmail = info.userEmail
        let homeroomLeader = 'dmurphy@bmss.com'
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
        homeroomLeader = data.recordset[0].StaffEMail
        pool.close()
        return homeroomLeader
    }

    getHomeroomLeader(info)
        .then(result => {
            console.log('getHomeroomLeader result log:')
            let keyValues = Object.entries(info)
            console.log(keyValues)
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: result,
                bcc: info.senderEmail,
                subject: `ROLO - Upward for ${info.name}`,
                html: `<h1 style="text-align: center">ROLO - Upward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
            })
        })
        .catch(err => {
            console.log(`Upward ROLO Email Error:\n${err}\n${info}`)
        })
}

let DOWNWARD = (info) => {
    const getHomeroomLeader = async (info) => {
        let recipientEmail = info.userEmail
        let homeroomLeader = 'dmurphy@bmss.com'
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
        homeroomLeader = data.recordset[0].StaffEMail
        pool.close()
        return homeroomLeader
    }

    getHomeroomLeader(info)
        .then(result => {
            if (result) {
                transporter.sendMail({
                    from: process.env.EM_USER,
                    to: "zealhr@bmss.com",
                    cc: `${result}; ${info.userEmail}`,
                    bcc: info.senderEmail,
                    subject: `ROLO - Downward for ${info.name}`,
                    html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${info.name}</p><p><strong>Project: </strong>${info.project}</p><p><strong>How did ${info.name} do on the project? </strong>${info.rating}</p><p><strong>Submitted by: </strong>${info.senderName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${info.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${info.lose}</p>`
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
        .catch(err => {
            console.log(`Downard ROLO Email Error:\n${err}\n${info}`)
        })
}

module.exports = {
    EMAIL: EMAIL,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
