const sql   = require("mssql");
const PE    = require("./peapis.js")
const Email = require('./emailer.js')
const moment = require('moment')

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

const MENTOR_MEETING = (req, res) => {
    const metWithMentor = async requestBody => {
        let token = await PE.getToken()
        let mentor = await PE.getMyIndex(requestBody.requestedName, token)
        let mentee = await PE.getMyIndex(requestBody.senderName, token)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let mentorPool = await pool.connect()
        await mentorPool.request()
            .input('mentor', sql.Int, mentor.StaffIndex)
            .input('mentee', sql.Int, mentee.StaffIndex)
            .input('metDate', sql.Date, requestBody.date)
            .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient)
                    VALUES(9, @metDate, @mentee, @mentor)`)
        pool.close()

        return mentee
    }

    metWithMentor(req.body)
        .then(result => {
            Email.mentor(result)
            res.send('Thanks for letting us know you and your mentor met together!')
        })
        .catch(err => {
            console.log(`Mentor error - ${moment().format('LLL')}`)
            console.log(req.body)
            console.log(err)
        })
}

module.exports = {
    mentorMeeting: MENTOR_MEETING
}
