const sql = require("mssql")
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EM_USER,
        pass: process.env.EM_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

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

const BASE = (req, res) => {
    const cancelCheckout = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let cancelPool = await pool.connect()
        await cancelPool.request()
            .input('officeCode', sql.Int, req.body.code)
            .query(`DELETE FROM dbo.OpenOffices WHERE OfficeCode = @officeCode`)
        pool.close()
        return true
    }

    cancelCheckout()
        .then(() => {
            res.send('The checkout has been canceled, thank you.')
        })
        .catch(err => {
            console.log(`Checkout cancelCheckout Error:\n${err}`)
        })
}

const CANCEL = (req, res) => {
    const getOfficeInfo = async () => {
        let pool = new sql.ConnectionPool(config.datawarehouse)
        let officePool = await pool.connect()
        let data = await officePool.request()
            .input('checkoutID', sql.Int, req.params.id)
            .query(`SELECT [Name]
            ,[EmployeeID]
            ,[OfficeCode]
            FROM [DataWarehouse].[dbo].[OpenOffices] O
            WHERE ID = @checkoutID`)
        let officeInfo = data.recordset[0]
        pool.close()
        return officeInfo
    }

    const getStaffEmail = async (staff) => {
        let pool = new sql.ConnectionPool(config.engine)
        let emailPool = await pool.connect()
        let data = await emailPool.request()
            .input('staffID', sql.Int, staff)
            .query(`SELECT StaffEMail FROM dbo.tblStaff WHERE StaffIndex = @staffID AND StaffEnded IS NULL`)
        let email = data.recordset[0].StaffEMail
        pool.close()
        return email
    }
    
    getOfficeInfo()
        .then(resultOffice => {
            getStaffEmail(resultOffice.EmployeeID)
                .then(email => {
                    transporter.sendMail({
                        from: process.env.EM_USER,
                        to: email,
                        subject: `${resultOffice.Name} Cancelation Code`,
                        html: `<p>Please use the following code to cancel your selected office checkout.</p><br><p><strong>${resultOffice.OfficeCode}</strong></p>`
                    })
                })
                .then(() => {
                    res.send('The office checkout code has been emailed to you, please check your inbox')
                })
                .catch(err => {
                    console.log(`Checkout Cancel getStaffEmail Error:\n${err}`)
                })
        })
        .catch(err => {
            console.log(`Checkout Cancel getOfficeInfo Error:\n${err}`)
        })
}

module.exports = {
    BASE: BASE,
    CANCEL: CANCEL
}