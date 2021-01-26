const sql = require("mssql")
const RandExp = require('randexp')

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

const GETOFFICES = (req, res) => {
     
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT DISTINCT Name, Location, Site, Number
        FROM dbo.OpenOffices
        WHERE Active = 1 AND Site = '${req.params.site}'
        ORDER BY Number ASC;`, (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
    })
}

const GETSTANDUP = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT DISTINCT Name, Location, Site, Number
        FROM dbo.OpenOffices
        WHERE Active = 1 AND Site = '${req.params.site}' AND Standup = 1
        ORDER BY Number ASC;`, (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
    })
}

const GETNONSTANDUP = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT DISTINCT Name, Location, Site, Number
        FROM dbo.OpenOffices
        WHERE Active = 1 AND Site = '${req.params.site}' AND Standup = 0
        ORDER BY Number ASC;`, (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
    })
}

const THISOFFICE = (req, res) => {    
     
    let id = req.params.id
    let patt = /_/g
    id = id.replace(patt, " ")

    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT ID
        ,Name
        ,S.StaffName
        ,StandUp
        ,Site
        ,Location
        ,CONVERT(datetime, [CheckedIn], 120) AS CheckedIn
        ,CONVERT(DATETIME, [CheckedOut], 120) AS CheckedOut
        ,ImagePath
        ,OfficeCode
        ,Number
        FROM dbo.OpenOffices
        INNER JOIN dbo.tblStaff S ON EmployeeID = S.StaffIndex
        WHERE Name = '${id}' AND Site = '${req.params.site}';`, (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
    })
}

const CHECKOUT = (req, res) => {
    let {email, name, location, site, standUp, checkedOut, checkedIn, image, number} = req.body
    let patt = /.'/g
    if (patt.test(location)) {
        location = location.replace("'", "''")
    }
    let randexp = new RandExp(/[1-9]\d\d\d\d\d/)

    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`DECLARE @employee int
        SET @employee = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEmail = '${email}' AND StaffEnded IS NULL)
        
        INSERT INTO dbo.OpenOffices (Name, Location, Site, StandUp, CheckedOut, CheckedIn, EmployeeID, ImagePath, OfficeCode, Number, Active)
        VALUES ('${name}', '${location}', '${site}', ${standUp}, CONVERT(DATETIME, '${checkedOut}', 120), CONVERT(DATETIME,'${checkedIn}', 120), @employee, '${image}', ${randexp.gen()}, ${number}, 1);`, 
        (err, recordset) => {
            if (err) {
                console.log(err)
                console.log(req.body)
            } else {
                res.send("Thanks for checking out this office!")
            }
        })
    })
}

const STAFF = (req, res) => {
    let id = req.params.id
    let patt = /_/g
    id = id.replace(patt, " ")
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT S.StaffName
        ,O.Name
		,O.Location
		,O.CheckedIn
        ,O.CheckedOut
        ,O.ImagePath
        ,O.ID
FROM dbo.OpenOffices O
INNER JOIN dbo.tblStaff S ON O.EmployeeID = S.StaffIndex
WHERE S.StaffName LIKE '%${id}%' AND GETDATE() BETWEEN CheckedOut AND CheckedIn;`,
        (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
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