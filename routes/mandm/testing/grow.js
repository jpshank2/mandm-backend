const sql    = require("mssql");
const PE     = require("./peapis.js")
const Email  = require("./emailer.js")
const moment = require("moment")

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

const POST_GROW = (req, res) => {
    const postGrow = async grow => {
        let token = await PE.getToken()
        let { senderName, submissions } = grow.body
        let senderInfo = await PE.getMyIndex(senderName, token)

        let pool = new sql.ConnectionPool(config.datawarehouse)
        let growPool = await pool.connect()
        
        for(let i = 0; i < submissions.length; i++) {
            await growPool.request()
                .input('growType', sql.Int, submissions[i].type)
                .input('growHeader', sql.NVarChar, submissions[i].heading)
                .input('growSender', sql.Int, senderInfo.StaffIndex)
                .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubHeading)
                        VALUES (@growType, GETDATE(), @growSender, 0, @growHeader)`)
        }

        pool.close()

        return {sender: senderInfo, submissions: submissions}
    }

    postGrow(req)
        .then(result => {
            Email.grow(result)
            res.send('Thanks for growing the family!')
        })
        .catch(err => {
            console.log(`postGrow error - ${moment().format('LLL')}\n`)
            console.log(req.body)
            console.log(err)
        })
}

module.exports = {
    GROW: POST_GROW
}
