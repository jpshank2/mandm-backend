const sql = require("mssql");
const SendMail = require("./sendmail.js")
const CheckIn = require("./checkin.js");

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

const BASE = (req, res) => {
    let userName = req.params.name
    const getHomeroomMembers = async (userName) => {
        let pool = new sql.ConnectionPool(config.engine)
        let homeroomPool = await pool.connect()
        let data = await homeroomPool.request()
            .input('staff', sql.NVarChar, userName)
            .query(`SELECT S.StaffIndex, S.StaffName, S.StaffCode
            FROM dbo.tblCategory H
            INNER JOIN tblStaffEx SE ON SE.StaffSubDepartment = H.Category AND H.CatType = 'SUBDEPT'
            INNER JOIN tblStaff S ON S.StaffIndex = SE.StaffIndex
            WHERE H.CatName = (SELECT StaffName FROM dbo.tblStaff WHERE StaffEMail = CONCAT(@staff, '@bmss.com')) AND S.StaffType <> 4`)
        let staff = data.recordset
        pool.close()
        return staff
    }

    const getLastDate = async (staffMember) => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let datePool = await pool.connect()
        let data = await datePool.request()
            .input('staff', sql.NVarChar, staffMember)
            .query(`SELECT TOP 1 EventDate
            FROM dbo.MandM
            WHERE EventPerson = @staff AND EventAction = 'HR-LEADER'
            ORDER BY EventDate DESC`)
        let lastDate = data.recordset.length > 0 ? data.recordset[0].EventDate : '2020-01-01T16:37:42.320Z'
        pool.close()
        return lastDate
    }

    const dualDataList = async (list, callback) => {
        let finalList = []
        for (let i = 0; i < list.length; i++) {
            let staffName = list[i].StaffName
            let patt = /'/g
            staffName = staffName.replace(patt, "''")
            let date = await callback(staffName)
            finalList.push({...list[i], LastDate: date})
        }
        return finalList
    }

    switch (userName) {
        case 'acaldwell':
            getHomeroomMembers('blorimer')
                .then(result => {
                    dualDataList(result, getLastDate)
                        .then(resultList => {
                            res.send(resultList)
                        })
                        .catch(err => {
                            console.log(`Ashley Caldwell dualDataList Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`Ashley Caldwell Homeroom Error:\n${err}`)
                })
            break
        case 'dbrock':
            let members = []
            getHomeroomMembers('dbrock')
                .then(result => {
                    members = [...members, ...result]
                })
                .then(() => {
                    getHomeroomMembers('kfluker')
                        .then(result => {
                            members = [...members, ...result]
                        })
                        .then(() => {
                            getHomeroomMembers('bbrown')
                                .then(result => {
                                    members = [...members, ...result]
                                    return members
                                })
                                .then(result => {
                                    dualDataList(result, getLastDate)
                                        .then(resultList => {
                                            res.send(resultList)
                                        })
                                        .catch(err => {
                                            console.log(`Daniel Brock dualDataList Error:\n${err}`)
                                        })
                                })
                                .catch(err => {
                                    console.log(`Brad Brown DJB Homeroom Error:\n${err}`)
                                })
                        })
                        .catch(err => {
                            console.log(`Kate Fluker DJB Homeroom Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`Daniel Brock DJB Homeroom Error:\n${err}`)
                })            
            break
        case 'tzablan':
            getHomeroomMembers('munderhill')
                .then(result => {
                    dualDataList(result, getLastDate)
                        .then(resultList => {
                            res.send(resultList)
                        })
                        .catch(err => {
                            console.log(`Trae Zablan dualDataList Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`Trae Zablan Homeroom Error:\n${err}`)
                })
            break
        case 'astapler':
            getHomeroomMembers('jcarroll')
                .then(result => {
                    dualDataList(result, getLastDate)
                        .then(resultList => {
                            res.send(resultList)
                        })
                        .catch(err => {
                            console.log(`Amy Stapler dualDataList Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`Amy Stapler Homeroom Error:\n${err}`)
                })
            break
        case 'rbowers':
            getHomeroomMembers('mbrand')
                .then(result => {
                    dualDataList(result, getLastDate)
                        .then(resultList => {
                            res.send(resultList)
                        })
                        .catch(err => {
                            console.log(`Rachel Bowers dualDataList Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`Rachel Bowers Homeroom Error:\n${err}`)
                })
            break
        default:
            getHomeroomMembers(userName)
                .then(result => {
                    dualDataList(result, getLastDate)
                        .then(resultList => {
                            res.send(resultList)
                        })
                        .catch(err => {
                            console.log(`${userName} dualDataList Error:\n${err}`)
                        })
                })
                .catch(err => {
                    console.log(`${userName} Homeroom Error:\n${err}`)
                })
    }
}

const TPOST = (req, res) => {
    if (req.body.memberChecked === 1) {
        CheckIn.MPOST(req)
        SendMail.MEMEMAIL(req.body.senderEmail)
    }
    if (req.body.checked.length > 0) {
        let checked = []
        let checkedWithRating = []
        req.body.checked.forEach((person, index) => {
            let name = person.substring(0, person.length - 4)
            let holder = 0
            for (let i = req.body.checked.length - 1; i >= 0; i--) {
                let number = parseInt(req.body.checked[i].substring(req.body.checked[i].length - 1))
                if (req.body.checked[i].includes(name) && number > 0) {
                    holder = i
                    if (holder === index) {
                        let feelingString = ""
                        switch(number) {
                            case 1:
                            feelingString = "Worst week ever – nothing went right this week"
                            break
                            case 2:
                            feelingString = "Not a good week – I am overwhelmed and didn’t achieve much"
                            break
                            case 3:
                            feelingString = "Just an okay week - some good and some bad"
                            break
                            case 4:
                            feelingString = "Pretty good week - most things went right this week"
                            break
                            case 5:
                            feelingString = "Best week ever - I feel like a Rockstar"
                            break
                        }
                        checked.push(`${name} - ${feelingString}`)
                        checkedWithRating.push({name: name, rating: number})
                    } else {
                        return
                    }
                }
            }
        })
        if (checked.length > 0) {
            SendMail.EMAIL(req.body, checked)
            CheckIn.POST(req, checkedWithRating)
            res.send("Thanks for checking in with your homeroom!")
        }
    }
}

module.exports = {
    BASE: BASE,
    TPOST: TPOST
}
