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

const GETOFFICES = (req, res) => {
    const getOffices = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('officeSite', sql.NVarChar, req.params.site)
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = UPPER(@officeSite)
            ORDER BY OfficeIndex ASC;`)
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
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = UPPER(@officeSite) AND OfficeStandUp = 1
            ORDER BY OfficeIndex ASC;`)
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
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = UPPER(@officeSite) AND OfficeStandUp = 0
            ORDER BY OfficeIndex ASC;`)
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
    const getThisOffice = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let appointments = []
        let data = await officePool.request()
                .input('officeSite', sql.NVarChar, req.params.site)
                .input('deskID', sql.NVarChar, req.params.id)
                .query(`SELECT R.ReservationIndex,
                O.OfficeName,
                R.ReservationEmployee,
                O.OfficeStandUp,
                O.OfficeSite,
                O.OfficeLocation,
                R.ReservationCheckOut,
                R.ReservationCheckIn,
                O.OfficeImage,
                R.ReservationCode
            FROM Office.Reservations R
                INNER JOIN Office.Offices O ON O.OfficeIndex = R.ReservationOffice
            WHERE O.OfficeIndex = @deskID
            AND (GETDATE() <= R.ReservationCheckOut OR GETDATE() <= R.ReservationCheckIn)
            AND O.OfficeSite = UPPER(@officeSite);`)
        if(data.recordset.length > 0) {
            appointments = data.recordset
        } else {
            data = await officePool.request()
                .input('officeSite', sql.NVarChar, req.params.site)
                .input('deskID', sql.NVarChar, req.params.id)
                .query(`SELECT TOP 1 1 AS [ReservationIndex],
                O.OfficeName,
                0 AS [ReservationEmployee],
                O.OfficeStandUp,
                O.OfficeSite,
                O.OfficeLocation,
                '2020-05-18 14:00:00.000' AS [ReservationCheckOut],
                '2020-05-18 17:00:00.000' AS [ReservationCheckIn],
                O.OfficeImage
            FROM Office.Offices O
            WHERE O.OfficeIndex = @deskID
            AND O.OfficeSite = UPPER(@officeSite);`)
            appointments = data.recordset
        }
        pool.close()
        return appointments
    }



    // const dualDatabaseList = async (list, callback) => {
    //     let finalList = []
    //     for (let i = 0; i < list.length; i++) {
    //         let staffName = await callback(list[i].EmployeeID)
    //         finalList.push({...list[i], StaffName: staffName.StaffName})
    //     }
    //     return finalList
    // }

    getThisOffice()
        .then(resultApps => {
            res.send(resultApps)
        })
        .catch(err => {
            console.log(`Checkout Checkout getThisOffice Error:\n${err}`)
        })
}

const CHECKOUT = (req, res) => {
    let randexp = new RandExp(/[1-9]\d\d\d\d\d/)

    const checkoutOffice = async (requestBody) => {
        let {office, email, checkedOut, checkedIn} = requestBody
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        await officePool.request()
            .input('employee', sql.NVarChar, email)
            .input('officeID', sql.Int, office)
            .input('checkedOut', sql.NVarChar, checkedOut)
            .input('checkedIn', sql.NVarChar, checkedIn)
            .input('officeCode', sql.Int, randexp.gen())
            .query(`INSERT INTO Office.Reservations (ReservationOffice, ReservationEmployee, ReservationCheckOut, ReservationCheckIn, ReservationCode)
                    VALUES (@officeID, @employee, @checkedOut, @checkedIn, @officeCode)`)
        pool.close()
        return true
    }

    checkoutOffice(req.body)
        .then(() => {
            res.send('This office has been checked out, thank you')
        })
        .catch(err => {
            console.log(`Checkout Checkout checkoutOffice Error:\n${err}`)
        })
}

// const STAFF = (req, res) => {
//     let id = req.params.id
//     let patt = /_/g
//     id = id.replace(patt, " ")

//     const getStaffInfo = async (email) => {
//         let pool = new sql.ConnectionPool(config.engine)
//         let indexPool = await pool.connect()
//         let data = await indexPool.request()
//             .input('staff', sql.NVarChar, email)
//             .query(`SELECT S.StaffIndex, StaffName
//             FROM dbo.tblStaff S
//             WHERE StaffName LIKE CONCAT('%', @staff, '%') AND StaffEnded IS NULL`)
//         let staffInfo = data.recordset
//         pool.close()
//         return staffInfo
//     }

//     const getStaffCheckouts = async () => {
//         let staff = await getStaffInfo(id)
//         let returnList = []
//         let pool = new sql.ConnectionPool(config.datawarehouse)
//         let checkoutPool = await pool.connect()
//         for (let i = 0; i < staff.length; i++) {
//             let data = await checkoutPool.request()
//                 .input('staffIndex', sql.Int, staff[i].StaffIndex)
//                 .query(`SELECT O.Name
//                 ,O.Location
//                 ,O.CheckedIn
//                 ,O.CheckedOut
//                 ,O.ImagePath
//                 ,O.ID
//                 FROM dbo.OpenOffices O
//                 WHERE EmployeeID = @staffIndex AND GETDATE() BETWEEN CAST(CheckedOut AS date) AND CAST(CheckedIn AS date);`)
//             if (data.recordset.length > 0) {
//                 returnList.push({StaffName: staff.StaffName, ...data.recordset[0]})
//             }
//         }
//         pool.close()
//         return returnList
//     }

//     getStaffCheckouts()
//         .then(resultList => {
//             res.send(resultList)
//         })
//         .catch(err => {
//             console.log(`Checkout Checkout getStaffCheckouts Error:\n${err}`)
//         })
// }

module.exports = {
    BASE: GETOFFICES,
    SPECIFIC: THISOFFICE,
    CHECKOUT: CHECKOUT,
    // STAFF: STAFF,
    GETSTANDUP: GETSTANDUP,
    GETNONSTANDUP: GETNONSTANDUP
}