const sql = require("mssql");
const SendMail = require("./sendmail.js")
const CheckIn = require("./checkin.js")

const devConfig = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

const BASE = (req, res) => {
     
    sql.connect(devConfig, () => {
        let name

        if (req.params.name === 'kmoore' || req.params.name === 'hrussell') {
            name = 'dking'
        } else if (req.params.name === 'acaldwell') {
            name = 'blorimer'
        } else {
            name = req.params.name
        }
    
        let request = new sql.Request();
        if (name === 'dmurphy') {
            request.query(`SELECT [StaffIndex], [StaffName], [StaffCode]
            FROM tblStaff
            WHERE StaffEnded IS NULL AND StaffOffice IN ('BHM', 'GAD', 'HSV') AND StaffName <> 'Don Murphy'
            ORDER BY StaffIndex;`, (err, recordset) => {
                if (err) {console.log(err);}
                res.send(recordset);
            })
        } else if (name === 'dbrock') {
            request.query(`SELECT S.StaffIndex, S.StaffName, S.StaffCode, (SELECT TOP 1 EventDate
                                FROM dbo.MandM
                                WHERE EventPerson = S.StaffName
                                ORDER BY EventDate DESC) AS [LastDate]
                            FROM dbo.tblStaff S
                            WHERE S.StaffAttribute IN (10, 27, 28) 
                            AND S.StaffEnded IS NULL;`, (err, recordset) => {
                                if (err) {
                                    res.send(err)
                                }
                                res.send(recordset)
                })
        } else if (name === 'jcarroll') {
            request.query(`SELECT S.StaffIndex, S.StaffName, S.StaffCode, (SELECT TOP 1 EventDate
                                FROM dbo.MandM
                                WHERE EventPerson = S.StaffName
                                ORDER BY EventDate DESC) AS [LastDate]
                            FROM dbo.tblStaff S
                            WHERE S.StaffAttribute IN (3, 29) 
                            AND S.StaffEnded IS NULL;`, (err, recordset) => {
                                if (err) {
                                    res.send(err)
                                }
                                res.send(recordset)
                })
        } else {
            request.query(`DECLARE @staffCategory int

                            SET @staffCategory = (SELECT ML.Category 
                            FROM dbo.MandMLeaders ML 
                            INNER JOIN dbo.tblStaff S ON ML.StaffIndex = S.StaffIndex
                            WHERE S.StaffEMail LIKE '${name}%')
        
                            SELECT S.StaffIndex, S.StaffName, S.StaffCode, (SELECT TOP 1 EventDate
                                FROM dbo.MandM
                                WHERE EventPerson = S.StaffName
                                ORDER BY EventDate DESC) AS [LastDate]
                            FROM dbo.tblStaff S
                            WHERE S.StaffAttribute = @staffCategory 
                            AND S.StaffEnded IS NULL;`, (err, recordset) => {
                                if (err) {
                                    res.send(err)
                                }
                                res.send(recordset)
                            })
        }
    })
}


const POST = (req, res) => {
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

const MPOST = (req, res) => {
    if (req.body.memberChecked === 1) {
        CheckIn.MPOST(req)
        SendMail.MEMEMAIL(req.body.senderEmail)
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
    POST: POST,
    MPOST: MPOST,
    TPOST: TPOST
}
