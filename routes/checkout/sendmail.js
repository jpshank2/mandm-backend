const nodemailer = require('nodemailer');
const ical       = require('ical-generator');
const sql = require("mssql")

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
    const sendEmail = async info => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let officeData = await officePool.request()
            .input('officeID', sql.Int, info.office)
            .query(`SELECT OfficeName, OfficeLocation, OfficeImage
                    FROM Office.Offices
                    WHERE OfficeIndex = @officeID`)
        let dataForEmail = officeData.recordsets[0][0]
        pool.close()

        let content = ical({
            domain: 'bmss.com',
            events: [
                {
                    start: new Date(info.checkedOut),
                    end: new Date(info.checkedIn),
                    summary: `${dataForEmail.OfficeName} Check Out Information`,
                    htmlDescription: `<p>${dataForEmail.OfficeLocation} - click <a href="${dataForEmail.OfficeImage}">here</a> for an office location map.</p>`,
                    location: dataForEmail.OfficeName,
                    busystatus: 'free',
                    transparency: 'transparent'
                }
            ]
        }).toString();
    
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: info.email,
            subject: `${dataForEmail.OfficeName} Check Out Information`,
            text: 'Please see the attached appointment',
            icalEvent: {
                method: 'PUBLISH',
                content: content
            }
        })
    }
    sendEmail(info)
}

module.exports = {
    EMAIL: EMAIL
}