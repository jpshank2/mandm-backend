const sql = require("mssql");
const express = require('express')
const router = express.Router()
const SendMail = require("./sendmail.js")
const Update = require("./update.js");


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
    
    let name = req.params.name
    let patt = /.'/g
    if (patt.test(name)) {
        name = name.replace(patt, "''")
    }
    
    const getStaffData = async (name) => {
        let pool = await sql.connect(config.engine)
        let data = await pool.request()
            .input('staff', sql.NVarChar, name)
            .query(`  SELECT [StaffIndex], [StaffName], [StaffEMail]
            FROM [dbo].[tblStaff]
            WHERE StaffEnded IS NULL AND
            StaffName LIKE CONCAT(@staff, '%');`)
        let staff = data.recordset
        pool.close()
        return staff
    }

    getStaffData(name)
        .then(result => {
            res.send(result)
        })
}

const KUDOS = (req, res) => {
    if (req.body.description.length > 0) {
        Update.KUDOS(req.body)
        //SendMail.EMAIL(req.body)
        res.send(("Thanks for sending a KUDOS!"))
    }
}

const UPWARD = (req, res) => {
    console.log(req.body)
    if (req.body.retain.length > 0 || req.body.lose.length > 0) {
        Update.UPWARD(req.body)
        SendMail.UPWARD(req.body)
        res.send("Thanks for sending a ROLO!")
    }
}

const DOWNWARD = (req, res) => {
    console.log(req.body)
    if (req.body.retain.length > 0 || req.body.lose.length > 0) {
        Update.DOWNWARD(req.body)
        //SendMail.DOWNWARD(req.body)
        res.send("Thanks for sending a ROLO!")
    }
}

module.exports = {
    BASE: BASE,
    KUDOS: KUDOS,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
