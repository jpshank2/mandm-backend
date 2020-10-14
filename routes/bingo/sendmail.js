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

                            let messages = []

                            recordset.recordsets[0].forEach((email, index) => {
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

                                let message

                                if (index === 0) {
                                    message = {
                                        from: process.env.EM_USER,
                                        to: email.StaffEMail,
                                        bcc: 'kmoore@bmss.com, jeremyshank@bmss.com',
                                        subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                                        html: `<p>Remember to enter your time for yesterday by noon today!</p>`
                                    }    
                                } else {
                                    message = {
                                        from: process.env.EM_USER,
                                        to: email.StaffEMail,
                                        subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                                        html: `<p>Remember to enter your time for yesterday by noon today!</p>`
                                    }
                                }

                                messages.push(message)
                                
                            })

                            while(messages.length) {
                                pooledTransporter.sendMail(messages.shift())
                            }
                        })
                    })
}

let CHECK = number => {
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
        to: 'kmoore@bmss.com',
        cc: 'jeremyshank@bmss.com',
        subject: `Lynn has called a Bingo number today`,
        html: `<p>Today's number was ${letter} ${number}</p>`
    })
}

let WINNER = name => {
    transporter.sendMail({
        from: process.env.EM_USER,
        to: 'bingo@bmss.com',
        subject: `${name} Won Bingo!`,
        html: `<p>${name} has won this round of Bingo. We start a new game tomorrow!</p>`
    })
}

let NOWINNER = () => {
    transporter.sendMail({
        from: process.env.EM_USER,
        to: 'jeremyshank@bmss.com',
        subject: `No Winner for ${moment(Date.now()).format("MM/DD/YYYY")}`,
        html: '<p>EOM</p>'
    })
}

module.exports = {
    EMAIL: EMAIL,
    WINNER: WINNER,
    CHECK: CHECK,
    NOWINNER: NOWINNER
}