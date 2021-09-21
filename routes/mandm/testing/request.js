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

const SEND_REQUEST = (req, res) => {
    let { requestedName, project, senderEmail, senderName } = req.body

    // let patt = /'/g
    // project = project.replace(patt, "''")

    const postRequest = async (sender, requested, project) => {
        try {
            let token = await PE.getToken()
            let senderInfo = await PE.getMyIndex(sender, token)
            let recipient = await PE.getMyIndex(requested, token)
            let pool = new sql.ConnectionPool(config.datawarehouse)
            let postPool = await pool.connect()
            await postPool.request()
                .input('sender', sql.Int, senderInfo.StaffIndex)
                .input('recipient', sql.Int, recipient.StaffIndex)
                .input('project', sql.NVarChar, project)
                .query(`INSERT INTO MandM.Requests (ReqType, ReqDate, ReqSender, ReqRecipient, ReqProject)
                    VALUES (6, GETDATE(), @sender, @recipient, @project)`)
            pool.close()
            return {sender: senderInfo, recipient: recipient, project: project}
        } catch (err) {
            console.log(err)
        }
    }

    postRequest(senderName, requestedName, project)
        .then(result => {
            Email.request(result)
            res.send("Thanks for sending in a ROLO request!")
        })
        .catch(err => {
            console.log(`Send Request error - ${moment().format('LLL')}`)
            console.log(req.body)
            res.send(err)
        })
}

const GET_MY_REQUESTS = (req, res) => {
    const getRequests = async (myName) => {
        try {
            let token = await PE.getToken()
            let requested = await PE.getMyIndex(myName, token)
            let pool = new sql.ConnectionPool(config.datawarehouse)
            let getPool = await pool.connect()
            let requestData = await getPool.request()
                .input('requestIndex', sql.Int, requested.StaffIndex)
                .query(`SELECT ReqIndex, ReqSender, ReqRecipient, ReqProject 
                    FROM MandM.Requests
                    WHERE ReqLink IS NULL AND ReqRecipient = @requestIndex`)
            let myRequests = requestData.recordset
            pool.close()
            return myRequests
        } catch (err) {
            console.log(err)
        }
    }

    const getSenderInfo = async (requestList) => {
        let token = await PE.getToken()
        for (let i = 0; i < requestList.length; i++) {
            let senderInfo = await PE.getStaffInfo(requestList[i].ReqSender, token)
            requestList[i].senderName = senderInfo.StaffName
            requestList[i].senderEmail = senderInfo.StaffUser
        }

        return requestList
    }

    getRequests(req.body.myName)
        .then(resultRequests => {
            getSenderInfo(resultRequests)
                .then(allRequestInfo => {
                    res.send(allRequestInfo)
                })
                .catch(err => {
                    res.send(err)
                })
        })
        .catch(err => {
            console.log(`Get Requests error for ${req.body.myName} - ${moment().format('LLL')}`)
            res.send(err)
        })
}

const GET_OUTSTANDING = (req, res) => {
    const getOutstating = async (myName) => {
        let token = await PE.getToken()
        let sender = await PE.getMyIndex(myName, token)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let outstandingPool = await pool.connect()
        let outstandingData = await outstandingPool.request()
            .input('senderIndex', sql.Int, sender.StaffIndex)
            .query(`SELECT ReqIndex, ReqSender, ReqRecipient, ReqProject, ReqDate 
                FROM MandM.Requests
                WHERE ReqLink IS NULL AND ReqSender = @senderIndex`)
        let myRequests = outstandingData.recordset
        pool.close()
        return myRequests
    }

    const getSenderInfo = async (requestList) => {
        let token = await PE.getToken()
        for (let i = 0; i < requestList.length; i++) {
            let senderInfo = await PE.getStaffInfo(requestList[i].ReqRecipient, token)
            requestList[i].senderName = senderInfo.StaffName
            requestList[i].senderEmail = senderInfo.StaffUser
        }

        return requestList
    }

    getOutstating(req.body.myName)
        .then(resultRequests => {
            getSenderInfo(resultRequests)
                .then(allRequestInfo => {
                    res.send(allRequestInfo)
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(`Get Outstanding Requests for ${req.body.myName} - ${moment().format('LLL')}`)
            console.log(err)
        })
}

module.exports = {
    BASE: SEND_REQUEST,
    GET: GET_MY_REQUESTS,
    OUTSTANDING: GET_OUTSTANDING
}
