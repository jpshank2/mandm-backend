const nodemailer = require('nodemailer')

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

let BASE = info => {
    //console.log(info)
    let priority
    let location

    switch (info.Priority) {
        case 1:
            priority = 'Low Priority'
            break;
        case 2:
            priority = 'Medium Priority'
            break;
        case 3:
            priority = 'High Priority'
            break;
        default:
            priority = 'Low Priority'
            break;
    }

    switch (info.Location) {
        case 1: 
            location = 'Riverchase Office'
            break;
        case 2:
            location = 'Downtown Birmingham Office'
            break;
        case 3:
            location = 'Gadsden Office'
            break;
        case 4:
            location = 'Huntsville Office'
            break;
        case 5:
            location = 'Home'
            break;
        case 6:
            location = 'Client\'s Office'
            break
        default:
            location = 'Other'
    }

    transporter.sendMail({
        from: process.env.EM_USER,
        to: 'kennethrmoore+r4fjtpu7qbf00ob7nlm0@boards.trello.com',
        replyTo: 'jeremyshank@bmss.com',
        bcc: 'support@bmss.com',
        subject: priority,
        html: `<p style="text-align:center;">Jeremy Shank Date: ${moment(Date.now()).format("MM/DD/YYYY")}</p><p>Location: ${info.Location}</p><p>Having Problems with:</p><p>${info.Problem == 36 ? `Not Listed - ${info.NotListed}` : info.Problem}</p><p>${info.Describe}</p>`
    })
}

module.exports = {
    BASE: BASE
}