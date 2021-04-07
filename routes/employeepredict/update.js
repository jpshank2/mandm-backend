const sql = require("mssql")

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

const KUDOS = (info) => {
    let { project, description, name, senderEmail, cornerstone } = info
    let patt = /.'/g

    if (patt.test(description)) {
        description = description.replace(patt, "''")
    }
    if (patt.test(project)) {
        project = project.replace(patt, "''")
    }
    if (patt.test(name)) {
        name = name.replace(patt, "''")
    }

    const postKUDOS = async (info) => {
        let staffIndex = 0

        let pool = await sql.connect(config.engine)
        let data = await pool.request()
            .input('senderEmail', sql.NVarChar, info.senderEmail)
            .query(`SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEMail = @senderEmail`)
        staffIndex = data.recordset[0].StaffIndex
        pool.close()
        return staffIndex
    }

    postKUDOS(info)
        .then(result => {
            const dataWarehouseConnection = new sql.ConnectionPool(config.datawarehouse)
            dataWarehouseConnection.connect()
                .then(pool => {
                    const sqlQuery = `INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, @recipient, 'M+M', 'FEEDBACK', 'KUDOS', CONCAT(@cornerstone, ' - ', @project, ': ', @description), @staffIndex, @senderEmail);`

                    return new sql.Request(pool)
                        .input('recipient', sql.NVarChar, name)
                        .input('cornerstone', sql.NVarChar, cornerstone)
                        .input('project', sql.NVarChar, project)
                        .input('description', sql.NVarChar, description)
                        .input('staffIndex', sql.Int, result)
                        .input('senderEmail', sql.NVarChar, senderEmail)
                        .query(sqlQuery)
                })
                .then(() => {
                    return dataWarehouseConnection.close()
                })
                .catch(err => {
                    console.log(`KUDOS error:\n${err}\n${info}`)
                })

        })
        .catch(err => {
            console.log(`KUDOS error:\n${err}\n${info}`)
        })
}

const UPWARD = info => {
    let { project, name, senderEmail, retain, lose, rating } = info
    let patt = /.'/g

    if (patt.test(retain)) {
        retain = retain.replace(patt, "''")
    }
    if (patt.test(lose)) {
        lose = lose.replace(patt, "''")
    }
    if (patt.test(project)) {
        project = project.replace(patt, "''")
    }
    if (patt.test(name)) {
        name = name.replace(patt, "''")
    }

    const postUpward = async (info) => {
        let staffIndex = 0

        let pool = await sql.connect(config.engine)
        let data = await pool.request()
            .input('senderEmail', sql.NVarChar, info.senderEmail)
            .query(`SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEMail = @senderEmail`)
        staffIndex = data.recordset[0].StaffIndex
        pool.close()
        return staffIndex
    }

    postUpward(info)
        .then(result => {
            const dataWarehouseConnection = new sql.ConnectionPool(config.datawarehouse)
            dataWarehouseConnection.connect()
                .then(pool => {
                    const sqlQuery = `INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, @recipient, 'M+M', 'FEEDBACK', 'UPWARD', CONCAT(@project, CONCAT('; Rating - ', CONCAT(@rating, CONCAT('; Retain - ', CONCAT(@retain, CONCAT('; Lose - ', @lose)))))), @staffIndex, @senderEmail);`

                    return new sql.Request(pool)
                        .input('recipient', sql.NVarChar, name)
                        .input('rating', sql.NVarChar, rating)
                        .input('project', sql.NVarChar, project)
                        .input('retain', sql.NVarChar, retain)
                        .input('lose', sql.NVarChar, lose)
                        .input('staffIndex', sql.Int, result)
                        .input('senderEmail', sql.NVarChar, senderEmail)
                        .query(sqlQuery)
                })
                .then(() => {
                    return dataWarehouseConnection.close()
                })
                .catch(err => {
                    console.log(`Upward ROLO error:\n${err}\n${info}`)
                })

        })
        .catch(err => {
            console.log(`Upward ROLO error:\n${err}\n${info}`)
        })
}

const DOWNWARD = info => {
    let { project, name, senderEmail, retain, lose, rating } = info
    let patt = /.'/g

    if (patt.test(retain)) {
        retain = retain.replace(patt, "''")
    }
    if (patt.test(lose)) {
        lose = lose.replace(patt, "''")
    }
    if (patt.test(project)) {
        project = project.replace(patt, "''")
    }
    if (patt.test(name)) {
        name = name.replace(patt, "''")
    }

    const postDownward = async (info) => {
        let staffIndex = 0

        let pool = await sql.connect(config.engine)
        let data = await pool.request()
            .input('senderEmail', sql.NVarChar, info.senderEmail)
            .query(`SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEMail = @senderEmail`)
        staffIndex = data.recordset[0].StaffIndex
        pool.close()
        return staffIndex
    }

    postDownward(info)
        .then(result => {
            const dataWarehouseConnection = new sql.ConnectionPool(config.datawarehouse)
            dataWarehouseConnection.connect()
                .then(pool => {
                    const sqlQuery = `INSERT INTO [dbo].[MandM](EventDate, EventPerson, EventType, EventClass, EventAction, EventNotes, EventStaff, EventUpdatedBy)
                    VALUES (CURRENT_TIMESTAMP, @recipient, 'M+M', 'FEEDBACK', 'UPWARD', CONCAT(@project, '; Rating - ', @rating, '; Retain - ', @retain '; Lose - ', @lose), @staffIndex, @senderEmail);`

                    return new sql.Request(pool)
                        .input('recipient', sql.NVarChar, name)
                        .input('rating', sql.NVarChar, rating)
                        .input('project', sql.NVarChar, project)
                        .input('retain', sql.NVarChar, retain)
                        .input('lose', sql.NVarChar, lose)
                        .input('staffIndex', sql.Int, result)
                        .input('senderEmail', sql.NVarChar, senderEmail)
                        .query(sqlQuery)
                })
                .then(() => {
                    return dataWarehouseConnection.close()
                })
                .catch(err => {
                    console.log(`Downward ROLO error:\n${err}\n${info}`)
                })
        })
        .catch(err => {
            console.log(`Downward ROLO error:\n${err}\n${info}`)
        })
}

module.exports = {
    KUDOS: KUDOS,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
