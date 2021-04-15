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
                    console.log(`KUDOS Inner Error:\n${err}\n${info}`)
                })

        })
        .catch(err => {
            console.log(`KUDOS Outer Error:\n${err}\n${info}`)
        })
}

const UPWARD = info => {
    let patt = /.'/g

    if (patt.test(info.retain)) {
        info.retain = info.retain.replace(patt, "''")
    }
    if (patt.test(info.lose)) {
        info.lose = info.lose.replace(patt, "''")
    }
    if (patt.test(info.project)) {
        info.project = info.project.replace(patt, "''")
    }
    if (patt.test(info.name)) {
        info.name = info.name.replace(patt, "''")
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
                        .input('recipient', sql.NVarChar, info.name)
                        .input('rating', sql.NVarChar, info.rating)
                        .input('project', sql.NVarChar, info.project)
                        .input('retain', sql.NVarChar, info.retain)
                        .input('lose', sql.NVarChar, info.lose)
                        .input('staffIndex', sql.Int, result)
                        .input('senderEmail', sql.NVarChar, info.senderEmail)
                        .query(sqlQuery)
                })
                .then(() => {
                    return dataWarehouseConnection.close()
                })
                .catch(err => {
                    console.log(`Upward ROLO Inner Error:\n${err}\n${info}`)
                })

        })
        .catch(err => {
            console.log(`Upward ROLO Outer Error:\n${err}\n${info}`)
        })
}

const DOWNWARD = info => {
    let patt = /.'/g

    if (patt.test(info.retain)) {
        info.retain = info.retain.replace(patt, "''")
    }
    if (patt.test(info.lose)) {
        info.lose = info.lose.replace(patt, "''")
    }
    if (patt.test(info.project)) {
        info.project = info.project.replace(patt, "''")
    }
    if (patt.test(info.name)) {
        info.name = info.name.replace(patt, "''")
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
                    VALUES (CURRENT_TIMESTAMP, @recipient, 'M+M', 'FEEDBACK', 'UPWARD', CONCAT(@project, '; Rating - ', @rating, '; Retain - ', @retain, '; Lose - ', @lose), @staffIndex, @senderEmail);`

                    return new sql.Request(pool)
                        .input('recipient', sql.NVarChar, info.name)
                        .input('rating', sql.NVarChar, info.rating)
                        .input('project', sql.NVarChar, info.project)
                        .input('retain', sql.NVarChar, info.retain)
                        .input('lose', sql.NVarChar, info.lose)
                        .input('staffIndex', sql.Int, result)
                        .input('senderEmail', sql.NVarChar, info.senderEmail)
                        .query(sqlQuery)
                })
                .then(() => {
                    return dataWarehouseConnection.close()
                })
                .catch(err => {
                    console.log(`Downward ROLO Inner Error:\n${err}\n${info}`)
                })
        })
        .catch(err => {
            console.log(`Downward ROLO Outer Error:\n${err}\n${info}`)
        })
}

module.exports = {
    KUDOS: KUDOS,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
