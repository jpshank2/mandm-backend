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

const CHECKAVAILABILITY = (req, res) => {
    
    let { site, id } = req.params
    let patt = /_/g
    id = id.replace(patt, " ")

    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT *
        FROM dbo.OpenOffices
        WHERE Name = '${id}' 
        AND Site = '${site}'
        AND GETDATE() BETWEEN CheckedOut AND CheckedIn;`, (err, recordset) => {
            if (err) {
                console.log(err)
            } 
            res.send(recordset.recordsets[0])
        })
    })
}

module.exports = {
    AVAILABLE: CHECKAVAILABILITY
}