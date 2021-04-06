const sql = require("mssql")
const RandExp = require('randexp')

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

const getStaffInfo = async (email) => {
    let pool = new sql.ConnectionPool(config.engine)
    let indexPool = await pool.connect()
    let data = await indexPool.request()
        .input('staff', sql.Int, email)
        .query(`SELECT S.StaffName
        FROM dbo.tblStaff S
        WHERE StaffIndex = @staff`)
    let staffInfo = data.recordset[0]
    pool.close()
    return staffInfo
}

const GETOFFICES = (req, res) => {
    const getOffices = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('officeSite', sql.NVarChar, req.params.site)
            .query(`SELECT DISTINCT Name, Location, Site, Number
            FROM dbo.OpenOffices
            WHERE Active = 1 AND Site = @officeSite
            ORDER BY Number ASC;`)
        let offices = data.recordset
        pool.close()
        return offices
    }

    getOffices()
        .then(resultOffices => {
            res.send(resultOffices)
        })
        .catch(err => {
            console.log(`Checkout Checkout getOffices Error:\n${err}`)
        })
}

const GETSTANDUP = (req, res) => {
    const getOffices = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('officeSite', sql.NVarChar, req.params.site)
            .query(`SELECT DISTINCT Name, Location, Site, Number
            FROM dbo.OpenOffices
            WHERE Active = 1 AND Site = @officeSite
            AND Standup = 1
            ORDER BY Number ASC;`)
        let offices = data.recordset
        pool.close()
        return offices
    }

    getOffices()
        .then(resultOffices => {
            res.send(resultOffices)
        })
        .catch(err => {
            console.log(`Checkout Checkout getOffices Error:\n${err}`)
        })
}

const GETNONSTANDUP = (req, res) => {
    const getOffices = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('officeSite', sql.NVarChar, req.params.site)
            .query(`SELECT DISTINCT Name, Location, Site, Number
            FROM dbo.OpenOffices
            WHERE Active = 1 AND Site = @officeSite
            AND Standup = 0
            ORDER BY Number ASC;`)
        let offices = data.recordset
        pool.close()
        return offices
    }

    getOffices()
        .then(resultOffices => {
            res.send(resultOffices)
        })
        .catch(err => {
            console.log(`Checkout Checkout getOffices Error:\n${err}`)
        })
}

const THISOFFICE = (req, res) => {    
     
    let id = req.params.id
    let patt = /_/g
    id = id.replace(patt, " ")

    const getThisOffice = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let appointments = []
        let dateChange = 0
        while (appointments.length === 0) {
            let data = await officePool.request()
                .input('officeSite', sql.NVarChar, req.params.site)
                .input('deskName', sql.NVarChar, id)
                .input('positiveDateChange', sql.Int, dateChange)
                .input('negativeDateChange', sql.Int, -dateChange)
                .query(`SELECT ID
                    ,Name
                    ,EmployeeID
                    ,StandUp
                    ,Site
                    ,Location
                    ,CONVERT(datetime, [CheckedIn], 120) AS CheckedIn
                    ,CONVERT(DATETIME, [CheckedOut], 120) AS CheckedOut
                    ,ImagePath
                    ,OfficeCode
                    ,Number
                    FROM dbo.OpenOffices
                    WHERE Name = @deskName AND 
                    (CheckedIn > DATEADD(DAY, @positiveDateChange, GETDATE()) OR CheckedOut > DATEADD(DAY, @negativeDateChange, GETDATE())) AND Site = @officeSite;`)
            dateChange++
            appointments = data.recordset
        }
        pool.close()
        return appointments
    }



    const dualDatabaseList = async (list, callback) => {
        let finalList = []
        for (let i = 0; i < list.length; i++) {
            let staffName = await callback(list[i].EmployeeID)
            finalList.push({...list[i], StaffName: staffName.StaffName})
        }
        return finalList
    }

    getThisOffice()
        .then(resultApps => {
            dualDatabaseList(resultApps, getStaffInfo)
                .then(resultList => {
                    res.send(resultList)
                })
                .catch(err => {
                    console.log(`Checkout Checkout dualDatabaseList Error:\n${err}`)
                })
        })
        .catch(err => {
            console.log(`Checkout Checkout getThisOffice Error:\n${err}`)
        })
}

const CHECKOUT = (req, res) => {
    let {email, name, location, site, standUp, checkedOut, checkedIn, image, number} = req.body
    let patt = /.'/g
    if (patt.test(location)) {
        location = location.replace(patt, "''")
    }
    let randexp = new RandExp(/[1-9]\d\d\d\d\d/)
    const getStaffInfo = async (email) => {
        let pool = new sql.ConnectionPool(config.engine)
        let indexPool = await pool.connect()
        let data = await indexPool.request()
            .input('staff', sql.NVarChar, email)
            .query(`SELECT S.StaffIndex, H.CatName
            FROM dbo.tblStaff S
            INNER JOIN tblStaffEx SE ON SE.StaffIndex = S.StaffIndex
            INNER JOIN dbo.tblCategory H ON SE.StaffSubDepartment = H.Category AND H.CatType = 'SUBDEPT' WHERE StaffEMail = @staff`)
        let staffInfo = data.recordset[0]
        pool.close()
        return staffInfo
    }

    const checkoutOffice = async () => {
        let staffInfo = await getStaffInfo(email)
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        await officePool.request()
            .input('employee', sql.Int, staffInfo.StaffIndex)
            .input('officeName', sql.NVarChar, name)
            .input('officeLocation', sql.NVarChar, location)
            .input('officeSite', sql.NVarChar, site)
            .input('standUp', sql.Int, standUp)
            .input('checkedOut', sql.NVarChar, checkedOut)
            .input('checkedIn', sql.NVarChar, checkedIn)
            .input('imagePath', sql.NVarChar, image)
            .input('officeCode', sql.Int, randexp.gen())
            .input('officeNumber', sql.Int, number)
            .query(`INSERT INTO dbo.OpenOffices (Name, Location, Site, StandUp, CheckedOut, CheckedIn, EmployeeID, ImagePath, OfficeCode, Number, Active)
                    VALUES (@officeName, 
                        @officeLocation, 
                        @officeSite, 
                        @standUp, 
                        CONVERT(DATETIME, @checkedOut, 120), 
                        CONVERT(DATETIME, @checkedIn, 120), 
                        @employee, 
                        @imagePath, 
                        @officeCode, 
                        @officeNumber, 
                        1)`)
        pool.close()
        return true
    }

    checkoutOffice()
        .then(() => {
            res.send('This office has been checked out, thank you')
        })
        .catch(err => {
            console.log(`Checkout Checkout checkoutOffice Error:\n${err}`)
        })
}

const STAFF = (req, res) => {
    let id = req.params.id
    let patt = /_/g
    id = id.replace(patt, " ")

    const getStaffInfo = async (email) => {
        let pool = new sql.ConnectionPool(config.engine)
        let indexPool = await pool.connect()
        let data = await indexPool.request()
            .input('staff', sql.NVarChar, email)
            .query(`SELECT S.StaffIndex, StaffName
            FROM dbo.tblStaff S
            WHERE StaffName LIKE CONCAT('%', @staff, '%') AND StaffEnded IS NULL`)
        let staffInfo = data.recordset
        pool.close()
        return staffInfo
    }

    const getStaffCheckouts = async () => {
        let staff = await getStaffInfo(id)
        let returnList = []
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let checkoutPool = await pool.connect()
        for (let i = 0; i < staff.length; i++) {
            let data = await checkoutPool.request()
                .input('staffIndex', sql.Int, staff[i].StaffIndex)
                .query(`SELECT O.Name
                ,O.Location
                ,O.CheckedIn
                ,O.CheckedOut
                ,O.ImagePath
                ,O.ID
                FROM dbo.OpenOffices O
                WHERE EmployeeID = @staffIndex AND GETDATE() BETWEEN CAST(CheckedOut AS date) AND CAST(CheckedIn AS date);`)
            if (data.recordset.length > 0) {
                returnList.push({StaffName: staff.StaffName, ...data.recordset[0]})
            }
        }
        pool.close()
        return returnList
    }

    getStaffCheckouts()
        .then(resultList => {
            res.send(resultList)
        })
        .catch(err => {
            console.log(`Checkout Checkout getStaffCheckouts Error:\n${err}`)
        })
}

module.exports = {
    BASE: GETOFFICES,
    SPECIFIC: THISOFFICE,
    CHECKOUT: CHECKOUT,
    STAFF: STAFF,
    GETSTANDUP: GETSTANDUP,
    GETNONSTANDUP: GETNONSTANDUP
}