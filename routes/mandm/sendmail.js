const nodemailer = require('nodemailer')
const sql = require('mssql')

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

const RECRUIT = (info) => {
    let patt = /.''/g
    if (patt.test(info.notes)) {
        info.notes = info.notes.replace(patt, "'")
    }
    switch(info.option) {
        case 0:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Submitted a Resume to HR`,
                html: `<p>${info.senderName} submitted a resume to HR.</p><p>${info.notes}</p><br><p>Thanks for helping us find great candidates!</p>`
            })
            break;
        case 8:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Attended a Recruiting Event`,
                html: `<p>${info.senderName} attended a recruitment event</p><p>${info.notes}</p><br><p>Thanks for helping us find great candidates!</p>`
            })
            break;
        case 9:
            pooledTransporter.sendMail({
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
        info.notes = info.notes.replace(patt, "'")
    }
    pooledTransporter.sendMail({
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
        info.notes = info.notes.replace(patt, "'")
    }
    if (patt.test(info.name)) {
        info.name = info.name.replace(patt, "'")
    }
    switch(info.option) {
        case 2:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Visited Another Office`,
                html: `<p>${info.senderName} visited another office.</p><p>${info.notes}</p><br><p>Thanks for helping us build cross-location relationships!</p>`
            })
            break;
        case 3:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Sat in an Open Workspace`,
                html: `<p>${info.senderName} sat in an open workspace.</p><p>${info.notes}</p><br><p>Thanks for helping us build relationships!</p>`
            })
            break;
        case 4:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Had a Mentoring Conversation`,
                html: `<p>${info.senderName} had a mentoring conversation with ${info.name}.</p><p>${info.notes}</p><br><p>Thanks for helping us build each other up! Please remember to email HR with the meeting details within 3 days!</p>`
            })
            break;
        case 5:
            pooledTransporter.sendMail({
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
        info.notes = info.notes.replace(patt, "'")
    }
    switch(info.option) {
        case 6:
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "hgeary@bmss.com",
                //cc: "bshealy@bmss.com",
                bcc: info.senderEmail,
                subject: `${info.senderName} Taught a Training Class`,
                html: `<p>${info.senderName} taught a training class.</p><p>${info.notes}</p><br><p>Thanks for helping us train everyone!</p>`
            })
            break;
        case 7:
            pooledTransporter.sendMail({
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

const REQUEST = info => {

    let patt = /.''/g
    
    let name = info.name
    if (patt.test(name)) {
        name = name.replace(patt, "'")
    }

    let project = info.project
    if (patt.test(project)) {
        project = project.replace(patt, "'")
    }

    const getStaffEmail = async () => {
        let pool = new sql.ConnectionPool(config.engine)
        let emailPool = await pool.connect()
        let data = await emailPool.request()
            .input('requestedName', sql.NVarChar, info.name)
            .query(`SELECT StaffEMail FROM dbo.tblStaff WHERE StaffName = @requestedName AND StaffEnded IS NULL`)
        let email = data.recordset[0].StaffEMail
        pool.close()
        return email
    }

    getStaffEmail()
        .then(resultEmail => {
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: resultEmail,
                cc: info.senderEmail,
                subject: `${info.senderName} is Requesting a ROLO from ${name}`,
                html: `<p>${name},</p><p>${info.senderName} is requesting a ROLO for the ${project} project</p><p>Thanks in advance for submitting a ROLO!</p>`
            })
        })
        .catch(err => {
            console.log(`M+M Send Request Email Error:\n${err}`)
        })
}

module.exports = {
    RECRUIT: RECRUIT,
    FEEDBACK: FEEDBACK,
    RELATE: RELATE,
    EDUCATE: EDUCATE,
    REQUEST: REQUEST
}