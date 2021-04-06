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

const CHECKAVAILABILITY = (req, res) => {
    
    let { site, id } = req.params
    let patt = /_/g
    id = id.replace(patt, " ")

    const getAvailable = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let availablePool = await pool.connect()
        let data = await availablePool.request()
            .input('deskName', sql.NVarChar, id)
            .input('officeSite', sql.NVarChar, site)
            .query(`SELECT *
                FROM dbo.OpenOffices
                WHERE Name = @deskName 
                AND Site = @officeSite
                AND GETDATE() BETWEEN CheckedOut AND CheckedIn;`)
        let availableDesks = data.recordset
        pool.close()
        return availableDesks
    }

    getAvailable()
        .then(resultDesks => {
            res.send(resultDesks)
        })
        .catch(err => {
            console.log(`Checkout getAvailable Error:\n${err}`)
        })
}

module.exports = {
    AVAILABLE: CHECKAVAILABILITY
}