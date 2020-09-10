const nodemailer = require('nodemailer')
const sql = require("mssql");
const moment = require("moment")

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

let EMAIL = number => {
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`SELECT S.StaffEMail
                        FROM [DataWarehouse].[dbo].[Bingo] B
                        INNER JOIN dbo.tblStaff S ON B.BingoCard = StaffBingo
                        WHERE BingoNumber = ${number}`, (err, recordset) => {
                            if (err) {console.log(err); console.log("bingo sendmail.js draw error")}
                            recordset.recordsets[0].forEach((email) => {
                                let letter
                                let diff = number - 15
                                if (diff <= 0) {
                                    letter = 'B'
                                } else if (diff > 0 && diff <= 15) {
                                    letter = 'I'
                                } else if (diff > 15 && diff <= 30) {
                                    letter = 'N'
                                } else if (diff > 30 && diff <= 45) {
                                    letter = 'G'
                                } else {
                                    letter = 'O'
                                }

                                transporter.sendMail({
                                    from: process.env.EM_USER,
                                    to: email.StaffEMail,
                                    bcc: 'jeremyshank@bmss.com',
                                    subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                                    html: `<p>This is Jeremy testing Bingo</p>`
                                })
                            })
                        })
                    })
}

module.exports = {
    EMAIL: EMAIL
}