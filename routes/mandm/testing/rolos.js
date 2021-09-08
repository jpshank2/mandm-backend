const sql   = require("mssql");
const PE    = require("./peapis.js")
const Email = require("./emailer.js")

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

const SEND_ROLO = (req, res) => {
    const sendROLO = async (rolo) => {
        let token = await PE.getToken()
        let {direction, recipientName, recipientEmail, recipientIndex, project, requestIndex, retain, lose, rating, senderName, senderEmail} = rolo.body
        let recipient = await PE.getMyIndex(recipientName, token)
        if (recipientIndex === 0) {
            recipientIndex = recipient.StaffIndex
        }
        let sender = await PE.getMyIndex(senderName, token)

        let pool = new sql.ConnectionPool(config.datawarehouse)
        let roloPool = await pool.connect()
        await roloPool.request()
            .input('roloType', sql.Int, direction)
            .input('roloSender', sql.Int, sender.StaffIndex)
            .input('roloRecipient', sql.Int, recipientIndex)
            .input('roloRating', sql.Int, rating)
            .input('roloProject', sql.NVarChar, project)
            .input('retainOne', sql.NVarChar, retain)
            .input('loseOne', sql.NVarChar, lose)
            .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubRating, SubHeading, SubNotes1, SubNotes2)
                    VALUES (@roloType, GETDATE(), @roloSender, @roloRecipient, @roloRating, @roloProject, @retainOne, @loseOne)`)
        pool.close()
        return {sender: sender, recipient: recipient, direction: direction, project: project, retain: retain, lose: lose, rating: rating}
    }

    const sendRequested = async (rolo) => {
        let token = await PE.getToken()
        let {direction, recipientName, recipientEmail, recipientIndex, project, requestIndex, retain, lose, rating, senderName, senderEmail} = rolo.body
        let recipient = await PE.getMyIndex(recipientName, token)
        if (recipientIndex === 0) {
            recipientIndex = recipient.StaffIndex
        }
        let sender = await PE.getMyIndex(senderName, token)

        let pool = new sql.ConnectionPool(config.datawarehouse)
        let roloPool = await pool.connect()
        await roloPool.request()
            .input('roloType', sql.Int, direction)
            .input('roloSender', sql.Int, sender.StaffIndex)
            .input('roloRecipient', sql.Int, recipientIndex)
            .input('roloRating', sql.Int, rating)
            .input('roloProject', sql.NVarChar, project)
            .input('roloLink', sql.Int, requestIndex)
            .input('retainOne', sql.NVarChar, retain)
            .input('loseOne', sql.NVarChar, lose)
            .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubRating, SubHeading, SubNotes1, SubNotes2, SubLink)
                    VALUES (@roloType, GETDATE(), @roloSender, @roloRecipient, @roloRating, @roloProject, @retainOne, @loseOne, @roloLink)
                    UPDATE MandM.Requests
                    SET ReqLink = SCOPE_IDENTITY()
                    WHERE ReqIndex = @roloLink`)
        pool.close()
        return {sender: sender, recipient: recipient, direction: direction, project: project, retain: retain, lose: lose, rating: rating}
    }

    if (req.body.requestIndex === 0) {
        sendROLO(req)
            .then(result => {
                Email.rolos(result)
                res.send('Thanks for sending a ROLO!')
            })
            .catch(err => {
                console.log(err)
            })
    } else {
        sendRequested(req)
            .then(result => {
                Email.rolos(result)
                res.send('Thanks for sending a ROLO!')
            })
            .catch(err => {
                console.log(err)
            })
    }
}

const DELETE_ROLO = (req, res) => {
    const deleteROLO = async (roloInfo) => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let deletePool = await pool.connect()
        await deletePool.request()
            .input('subSender', sql.Int, roloInfo.SubSender)
            .input('subRecipient', sql.Int, roloInfo.SubRecipient)
            .input('subHeading', sql.NVarChar, roloInfo.SubHeading.replace(/'/g, "''"))
            .input('subLink', sql.Int, roloInfo.SubLink)
            .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubHeading, SubLink)
                    VALUES (8, GETDATE(), @subSender, @subRecipient, @subHeading, @subLink)
                    UPDATE MandM.Requests
                    SET ReqLink = SCOPE_IDENTITY()
                    WHERE ReqIndex = @subLink`)
        
        pool.close()
        return true
    }

    deleteROLO(req.body)
        .then(() => {
            res.send('Thanks for deleting that un-needed ROLO!')
        })
        .catch(err => {
            console.log(err)
        })
}

module.exports = {
    ROLO: SEND_ROLO,
    DELETE: DELETE_ROLO
}
