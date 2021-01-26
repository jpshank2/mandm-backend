const sql = require("mssql")

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

let KUDOS = (info) => {
    let project = info.description 
    let description = info.description
    let name = info.name
    let patt = /.'/g
    if (patt.test(description)) {
        description = description.replace("'", "''")
    }
    if (patt.test(project)) {
        project = project.replace("'", "''")
    }
    if (patt.test(name)) {
        name = name.replace("'", "''")
    }
    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staffIndex int
                    SET @staffIndex = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${info.senderEmail}')
                    INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, '${name}', 'M+M', 'FEEDBACK', 'KUDOS', '${info.cornerstone} - ${project}: ${description}', @staffIndex, '${info.senderEmail}');`, 
                    (err, recordset) => {
                        if (err) {
                            console.log(err)
                            console.log("update.js KUDOS error")
                        }
                    })
    })
}

let UPWARD = info => {
     
    let retain = info.retain
    let patt = /.'/g
    if (patt.test(retain)) {
        retain = retain.replace("'", "''")
    }

    let lose = info.lose
    if (patt.test(lose)) {
        lose = lose.replace("'", "''")
    }

    let name = info.name
    if (patt.test(name)) {
        name = name.replace("''")
    }

    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staffIndex int
        SET @staffIndex = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${info.senderEmail}')
        INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
        VALUES (CURRENT_TIMESTAMP, '${name}', 'M+M', 'FEEDBACK', 'UPWARD', '${info.project}: Rating - ${info.rating}; Retain - ${retain}; Lose - ${lose}', @staffIndex, '${info.senderEmail}');`, 
        (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("update.js UPWARD error")
            }
        })
    })
}

let DOWNWARD = info => {
     
    let retain = info.retain
    let patt = /.'/g
    if (patt.test(retain)) {
        retain = retain.replace("'", "''")
    }

    let lose = info.lose
    if (patt.test(lose)) {
        lose = lose.replace("'", "''")
    }

    let name = info.name
    if (patt.test(name)) {
        name = name.replace("''")
    }

    sql.connect(config, () => {
        let request = new sql.Request()
        request.query(`DECLARE @staffIndex int
        SET @staffIndex = (SELECT StaffIndex FROM [dbo].[tblStaff] WHERE StaffEMail = '${info.senderEmail}')
        INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
        VALUES (CURRENT_TIMESTAMP, '${name}', 'M+M', 'FEEDBACK', 'DOWNWARD', '${info.project}: Rating - ${info.rating}; Retain - ${retain}; Lose - ${lose}', @staffIndex, '${info.senderEmail}');`, 
        (err, recordset) => {
            if (err) {
                console.log(err)
                console.log("update.js DOWNWARD error")
            }
        })
    })
}

module.exports = {
    KUDOS: KUDOS,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}