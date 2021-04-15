const nodemailer = require('nodemailer')

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

let EMAIL = (info, checked) => {
    let d = new Date()
    d = d.toString().substring(4, 15)
    let list = ""
    checked.forEach(name => {
        list += `<li>${name}</li>`
    });
    pooledTransporter.sendMail({
        from: process.env.EM_USER,
        to: "hrussell@bmss.com",
        cc: "bshealy@bmss.com",
        bcc: info.senderEmail,
        subject: `${info.name} Checked In with their Homeroom`,
        html: `<h1 style="text-align: center">${d} Homeroom Check In</h1><br><h3>${info.name} checked in with:</h3><ul>${list}</ul>`
    })
}

let MEMEMAIL = (email) => {
    pooledTransporter.sendMail({
        from: process.env.EM_USER,
        to: email,
        subject: `Homeroom Leader Check in`,
        html: `<p>Thanks for letting us know you and your Homeroom Leader checked in together!</p>`
    })
}

module.exports = {
    EMAIL: EMAIL,
    MEMEMAIL: MEMEMAIL
}