const nodemailer = require('nodemailer')
const sql = require("mssql");
const moment = require("moment")
const PE = require('./peapis.js')

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
        port: 1433,
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
    try {
        //let messages = []
        let letter = 'B'
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

        const drawUsers = async () => {
            let staff = []

            let pool = new sql.ConnectionPool(config.datawarehouse)
            let drawPool = await pool.connect()
            let data = await drawPool.request()
                .input('number', sql.Int, number)
                .query(`SELECT BC.BingoUser
                FROM [dbo].[Bingo] B
                INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
                WHERE BingoNumber = @number AND BC.BingoCompany = 'BMSS'`)
            staff = data.recordset
            pool.close()
            return staff
        }

        const noDrawUsers = async () => {
            let staff = []

            let pool = new sql.ConnectionPool(config.datawarehouse)
            let noDrawPool = await pool.connect()
            let data = await noDrawPool.request()
                .input('number', sql.Int, number)
                .query(`SELECT DISTINCT BC.BingoUser
                FROM [dbo].[Bingo] B
                INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
                WHERE B.BingoCard NOT IN (SELECT B.BingoCard 
                    FROM dbo.Bingo B 
                    INNER JOIN dbo.BingoCards BC ON BC.BingoCard = B.BingoCard
                    WHERE BingoNumber = @number AND BC.BingoCompany = 'BMSS') 
                AND BC.BingoUser IS NOT NULL AND BC.BingoCompany = 'BMSS'`)
            staff = data.recordset
            pool.close()
            return staff
        }

        const createDrawEmails = async (userArray) => {
            let messages = []
            for (let i = 0; i < userArray.length; i++) {
                let data = await PE.getStaffInfo(userArray[i].BingoUser)
                if (i === 0) {
                    messages.push({
                        from: process.env.EM_USER,
                        to: data.StaffUser,
                        bcc: 'kmoore@bmss.com; jeremyshank@bmss.com; lpence@bmss.com',
                        subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                        html: `<p>You had ${letter} ${number} on your Bingo Card! Remember to enter your time for yesterday by noon today!</p>`
                    })
                } else {
                    messages.push({
                        from: process.env.EM_USER,
                        to: data.StaffUser,
                        subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                        html: `<p>You had ${letter} ${number} on your Bingo Card! Remember to enter your time for yesterday by noon today!</p>`
                    })
                }
            }
            pool.close()
            return messages
        }

        const createNoDrawEmails = async (userArray) => {
            let messages = []
            for (let i = 0; i < userArray.length; i++) {
                let data = await PE.getStaffInfo(userArray[i].BingoUser)
                messages.push({
                    from: process.env.EM_USER,
                    to: data.StaffUser,
                    subject: `Bingo Draw ${letter} ${number} - ${moment(Date.now()).format("MM/DD/YYYY")}`,
                    html: `<p>You did not have ${letter} ${number} on your Bingo Card. Better luck tomorrow!</p><p>Remember to enter your time for yesterday by noon today!</p>`
                })
            }
            pool.close()
            return messages
        }

        drawUsers()
            .then(result =>{
                createDrawEmails(result)
                    .then(emails => {
                        emails.forEach(email => {
                            pooledTransporter.sendMail(email)
                            // console.log(email)
                        })
                    })
                    .catch(err => {
                        console.log(`Bingo createDrawEmails Error:\n${err}`)
                    })
            })
            .then(() => {
                noDrawUsers()
                    .then(result => {
                        createNoDrawEmails(result)
                            .then(emails => {
                                emails.forEach(email => {
                                    pooledTransporter.sendMail(email)
                                    // console.log(email)
                                })
                            })
                            .catch(err => {
                                console.log(`Bingo createNoDrawEmails Error:\n${err}`)
                            })
                    })
                    .catch(err => {
                        console.log(`Bingo noDrawUsers Error:\n${err}`)
                    })
            })
            .catch(err => {
                console.log(`Bingo drawUsers Outer Error:\n${err}`)
            })
    } catch (err) {
        console.log(err)
    }
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
