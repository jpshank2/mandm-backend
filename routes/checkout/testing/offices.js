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
    }
}

const GETOFFICES = (req, res) => {
    const getOffices = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('officeSite', sql.NVarChar, req.params.site)
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation, OfficeSite
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = @officeSite
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
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation, OfficeSite
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = @officeSite
            AND OfficeStandup = 1
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
            .query(`SELECT OfficeIndex, OfficeName, OfficeLocation, OfficeSite
            FROM Office.Offices
            WHERE OfficeActive = 1 AND OfficeSite = @officeSite
            AND OfficeStandup = 0
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


module.exports = {
    getOffices: GETOFFICES,
    getStandUp: GETSTANDUP,
    getNonStandUp: GETNONSTANDUP
}