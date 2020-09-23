const sql = require("mssql")

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
        request.query(`SELECT DISTINCT Name, Location, Site, CONVERT(INT, SUBSTRING(Name, 22, 2)) AS Number
        FROM dbo.OpenOffices
        WHERE Name LIKE 'Upstairs%'
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
        ,CheckedIn
        ,CheckedOut
        ,ImagePath
        FROM dbo.OpenOffices
        INNER JOIN dbo.tblStaff S ON EmployeeID = S.StaffIndex
        WHERE Name = '${id}';`, (err, recordset) => {
            if (err) {
                console.log(err)
            } else {
                res.send(recordset.recordsets[0])
            }
        })
    })
}

const CHECKOUT = (req, res) => {
    let {email, name, location, site, standUp, checkedOut, checkedIn, image} = req.body
    let patt = /.'/g
    if (patt.test(location)) {
        location = location.replace("'", "''")
    }
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`DECLARE @employee int
        SET @employee = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffEmail = '${email}')
        
        INSERT INTO dbo.OpenOffices (Name, Location, Site, StandUp, CheckedOut, CheckedIn, EmployeeID, ImagePath)
        VALUES ('${name}', '${location}', '${site}', ${standUp}, '${checkedOut}', '${checkedIn}', @employee, '${image}');`, 
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
WHERE S.StaffName LIKE '%${id}%' AND CheckedOut > Convert(DateTime, DATEDIFF(DAY, 0, GETDATE()))
AND CheckedIn < Convert(DateTime, DATEDIFF(DAY, -1, GETDATE()));`,
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
    STAFF: STAFF
}