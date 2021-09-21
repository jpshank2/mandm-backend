const sql   = require("mssql");
const PE    = require("./peapis.js")
const Email = require("./emailer.js")
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

const SEND_KUDOS = (req, res) => {
    const sendKUDOS = async (kudos) => {
        let token = await PE.getToken()
        let {recipientName, recipientEmail, recipientIndex, cornerstone, description, senderName, senderEmail} = kudos.body
        let patt = /'/g
        let sqlDescribe = description.replace(patt, "''")
        let staff = await PE.getMyIndex(recipientName, token)
        if (recipientIndex === 0) {
            recipientIndex = staff.StaffIndex
        }
        let sender = await PE.getMyIndex(senderName, token)

        let pool = new sql.ConnectionPool(config.datawarehouse)
        let roloPool = await pool.connect()
        await roloPool.request()
            .input('kudosSender', sql.Int, sender.StaffIndex)
            .input('kudosRecipient', sql.Int, recipientIndex)
            .input('cornerstone', sql.NVarChar, cornerstone)
            .input('description', sql.NVarChar, description)
            .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubHeading, SubNotes1)
                    VALUES (5, GETDATE(), @kudosSender, @kudosRecipient, @cornerstone, @description)`)
        pool.close()
        return {sender: sender, recipient: staff, cornerstone: cornerstone, description: description}
    }

    
    sendKUDOS(req)
        .then(result => {
            Email.kudos(result)
            res.send('Thanks for sending a KUDOS!')
        })
        .catch(err => {
            console.log(`Kudos error - ${moment().format('LLL')}`)
            console.log(req.body)
            console.log(err)
        })
}

module.exports = {
    KUDOS: SEND_KUDOS
}