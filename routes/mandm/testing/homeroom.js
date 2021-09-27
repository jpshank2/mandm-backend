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
    }
}

const GET_HOMEROOM_MEMBERS = (req, res) => {

    let leader = ""
    switch (req.body.userName) {
        case "Ashley Caldwell":
            leader = "Bill Lorimer"
            break;
        case "Trae Zablan":
            leader = "Mark Underhill"
            break;
        case "Amy Stapler":
            leader = "Jamey Carroll"
            break;
        case "Rachel Bowers":
            leader = "Michael Brand"
            break;
        default:
            leader = req.body.userName
            break;
    }

    const getHomeroomMembers = async leader => {
        let token = await PE.getToken()
        let membersList = await PE.getHomeroom(leader, token)
        if (membersList.status === 200) {
            let members = []

            for (let i = 0; i < membersList.Results.length; i++) {
                let pool = new sql.ConnectionPool(config.datawarehouse)
                let checkinPool = await pool.connect()
                let dateData = await checkinPool.request()
                    .input('staffIndex', sql.Int, membersList.Results[i].StaffIndex)
                    .query(`SELECT TOP 1 SubDate FROM MandM.Submissions WHERE SubType = 3 AND SubRecipient = @staffIndex ORDER BY SubDate DESC`)
                let lastDate = dateData.recordset.length > 0 ? dateData.recordset[0].SubDate : '2020-01-01T16:37:42.320Z'
                pool.close()
                members.push({StaffIndex: membersList.Results[i].StaffIndex, StaffName: membersList.Results[i].StaffName, StaffLastDate: lastDate})
            }
            return members
        } else {
            return "Not a Homeroom Leader"
        }
    }

    if (leader === "Daniel Brock") {
        let genTrack = []
        getHomeroomMembers('Kate Fluker')
            .then(result => {
                genTrack = result
                getHomeroomMembers('Brad Brown')
                    .then(result => {
                        genTrack = [...genTrack, ...result]
                        getHomeroomMembers('Daniel Brock')
                            .then(result => {
                                res.send([...result, ...genTrack])
                            })
                            .catch(err => {
                                console.log(`Daniel Brock HR error - ${moment().format('LLL')}\n`)
                                console.log(err)
                            })
                    })
                    .catch(err =>{
                        console.log(`Brad Brown HR error - ${moment().format('LLL')}\n`)
                        console.log(err)
                    })
            })
            .catch(err => {
                console.log(`Kate Fluker HR error - ${moment().format('LLL')}\n`)
                console.log(err)
            })
    } else {
        getHomeroomMembers(leader)
            .then(result => {
                res.send(result)
            })
            .catch(err => {
                console.log(`${leader} HR error - ${moment().format('LLL')}\n`)
                console.log(err)
            })
    }

}

const GET_HOMEROOM_LEADERS = (req, res) => {
    const postCheckIn = async (myName) => {
        let token = await PE.getToken()
        let hrLeaderName = await PE.getMyHomeroom(myName, token)
        if (hrLeaderName) {
            let homeroomLeader = await PE.getMyIndex(hrLeaderName, token)
            let homeroomMember = await PE.getMyIndex(myName, token)
            let pool = new sql.ConnectionPool(config.datawarehouse)
            let checkinPool = await pool.connect()
            await checkinPool.request()
                .input('myIndex', sql.Int, homeroomMember.StaffIndex)
                .input('hrIndex', sql.Int, homeroomLeader.StaffIndex)
                .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient)
                        VALUES(4, GETDATE(), @myIndex, @hrIndex)`)
            pool.close()
            return {member: homeroomMember}
        } else {
            return 1
        }
    }

    postCheckIn(req.body.senderName)
        .then(result => {
            if (result !== 1) {
                Email.member(result)
            }
        })
        .catch(err => {
            console.log(`HR Leader error for ${req.body.senderName} - ${moment().format('LLL')}\n`)
            console.log(err)
        })
}

const HOMEROOM_CHECKIN = (req, res) => {
    const postLeaderCheckIn = async requestBody => {
        let token = await PE.getToken()
        let homeroomLeader = await PE.getMyIndex(requestBody.senderName, token)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let leaderPool = await pool.connect()
        for (let i = 0; i < requestBody.checked.length; i++) {
            let homeroomMember = await PE.getMyIndex(requestBody.checked[i].staff, token)
            await leaderPool.request()
                .input('homeroomLeader', sql.Int, homeroomLeader.StaffIndex)
                .input('homeroomMember', sql.Int, homeroomMember.StaffIndex)
                .input('rating', sql.Int, requestBody.checked[i].rating)
                .query(`INSERT INTO MandM.Submissions(SubType, SubDate, SubSender, SubRecipient, SubRating)
                        VALUES(3, GETDATE(), @homeroomLeader, @homeroomMember, @rating)`)
        }
        pool.close()
        return {leader: homeroomLeader, checkedMembers: requestBody.checked}
    }

    postLeaderCheckIn(req.body)
        .then(result => {
            Email.leader(result)
        })
        .catch(err => {
            console.log(`HR Leader Checkin error - ${moment().format('LLL')}\n`)
            console.log(req.body)
            console.log(err)
        })
}

module.exports = {
    getHomeroomMembers: GET_HOMEROOM_MEMBERS,
    getHomeroomLeaders: GET_HOMEROOM_LEADERS,
    memberCheckIn: HOMEROOM_CHECKIN
}
