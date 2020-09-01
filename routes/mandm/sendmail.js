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

const RECRUIT = (info) => {
    let patt = /.''/g
    if (patt.test(info.notes)) {
        info.notes = info.notes.replace("''", "'")
    }
    switch(info.option) {
        case 0:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Submitted a Resume to HR`,
                html: `<p>${info.senderName} submitted a resume to HR.</p><p>${info.notes}</p><br><p>Thanks for helping us find great candidates!</p>`
            })
            break;
        case 8:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Attended a Recruiting Event`,
                html: `<p>${info.senderName} attended a recruitment event</p><p>${info.notes}</p><br><p>Thanks for helping us find great candidates!</p>`
            })
            break;
        case 9:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Took a Candidate to Lunch/Dinner/Coffee`,
                html: `<p>${info.senderName} took a candidate out to Lunch/Dinner/Coffee.</p><p>${info.notes}</p><br><p>Thanks for helping us find great candidates!</p>`
            })
            break;
    }
    
}

const FEEDBACK = info => {
    let patt = /.''/g
    if (patt.test(info.notes)) {
        info.notes = info.notes.replace("''", "'")
    }
    transporter.sendMail({
        from: process.env.EM_USER,
        to: "hgeary@bmss.com",
        //cc: "bshealy@bmss.com",
        bcc: info.senderEmail,
        subject: `${info.senderName} Provided a Budget on a Project`,
        html: `<p>${info.senderName} provided a budget for a project.</p><p>${info.notes}</p><br><p>Thanks for helping us properly budget projects!</p>`
    })
}

const RELATE = info => {
    let patt = /.''/g
    if (patt.test(info.notes)) {
        info.notes = info.notes.replace("''", "'")
    }
    if (patt.test(info.name)) {
        info.name = info.name.replace("''", "'")
    }
    switch(info.option) {
        case 2:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Visited Another Office`,
                html: `<p>${info.senderName} visited another office.</p><p>${info.notes}</p><br><p>Thanks for helping us build cross-location relationships!</p>`
            })
            break;
        case 3:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Sat in an Open Workspace`,
                html: `<p>${info.senderName} sat in an open workspace.</p><p>${info.notes}</p><br><p>Thanks for helping us build relationships!</p>`
            })
            break;
        case 4:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Had a Mentoring Conversation`,
                html: `<p>${info.senderName} had a mentoring conversation with ${info.name}.</p><p>${info.notes}</p><br><p>Thanks for helping us build each other up! Please remember to email HR with the meeting details within 3 days!</p>`
            })
            break;
        case 5:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Went on a Fireside Chat`,
                html: `<p>${info.senderName} went on a Fireside Chat with Don.</p><br><p>Thanks for keeping up with the state of the firm!</p>`
            })
            break;
    }
}

const EDUCATE = info => {
    let patt = /.''/g
    if (patt.test(info.notes)) {
        info.notes = info.notes.replace("''", "'")
    }
    switch(info.option) {
        case 6:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Taught a Training Class`,
                html: `<p>${info.senderName} taught a training class.</p><p>${info.notes}</p><br><p>Thanks for helping us train everyone!</p>`
            })
            break;
        case 7:
            transporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Attended a Training Class`,
                html: `<p>${info.senderName} attended a training class.</p><p>${info.notes}</p><br><p>Thanks for keeping up with your training!</p>`
            })
            break;
    }
}

module.exports = {
    RECRUIT: RECRUIT,
    FEEDBACK: FEEDBACK,
    RELATE: RELATE,
    EDUCATE: EDUCATE
}