const sql = require("mssql");

const config = {
    user: process.env.DV_DB_USER,
    password: process.env.DV_DB_PASS,
    server: process.env.DV_DB_SERVER,
    database: process.env.DV_DB_DB,
    options: {
        encrypt: true
    }
}

const BASE = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT [SerialNumber], [DateGiven]
                FROM [dbo].[Computers]
                WHERE SerialNumber LIKE '#${req.params.id}%';`, (err, recordset) => {
            if (err) {console.log(err);}
            res.send(recordset);
        });
    });
}

const SP4_POST = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`DECLARE @staff int
                SET @staff = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffName = '${req.body.name}')
                INSERT INTO dbo.Computers (DateGiven, SerialNumber, Employee, Type)
                VALUES (CURRENT_TIMESTAMP, '#${req.body.serial}', @staff, 'Surface Pro 4')`, (err, recordset) => {
                    if (err) {console.log(err)}
                })
    })
}

const SPLT_POST = (req, res) => {
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`DECLARE @staff int
                SET @staff = (SELECT StaffIndex FROM dbo.tblStaff WHERE StaffName = '${req.body.name}')
                INSERT INTO dbo.Computers (DateGiven, SerialNumber, Employee, Type, Color)
                VALUES (CURRENT_TIMESTAMP, '#${req.body.serial}', @staff, 'Surface Pro Laptop', '${req.body.color}')`, (err, recordset) => {
                    if (err) {console.log(err)}
                })
    })
}

module.exports = {
    BASE: BASE,
    SP_POST: SP4_POST,
    LT_POST: SPLT_POST
}
