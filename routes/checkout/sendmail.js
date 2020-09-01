const nodemailer = require('nodemailer');
const ical       = require('ical-generator');

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
    let content = ical({
        domain: 'bmss.com',
        events: [
            {
                start: new Date(info.checkedOut),
                end: new Date(info.checkedIn),
                summary: `${info.name} Check Out Information`,
                htmlDescription: `<p>${info.location} - click <a href="${info.image}">here</a> for an office location map.</p>`,
                location: info.name,
                busystatus: 'free',
                transparency: 'transparent'
            }
        ]
    }).toString();

    transporter.sendMail({
        from: process.env.EM_USER,
        to: info.email,
        subject: `${info.name} Check Out Information`,
        text: 'Please see the attached appointment',
        icalEvent: {
            method: 'PUBLISH',
            content: content
        }
    })
}

module.exports = {
    EMAIL: EMAIL
}