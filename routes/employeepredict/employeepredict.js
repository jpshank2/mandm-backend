const sql = require("mssql");
const SendMail = require("./sendmail.js")
const Update = require("./update.js");


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
    
    let name = req.params.name
    let patt = /.'/g
    if (patt.test(name)) {
        name = name.replace("'", "''")
    }
     
    sql.connect(config, () => {
        let request = new sql.Request();
        request.query(`SELECT [StaffIndex], [StaffName], [StaffEMail]
                FROM [dbo].[tblStaff]
                WHERE StaffEnded IS NULL AND
                StaffName LIKE '${name}%';`, (err, recordset) => {
            if (err) {console.log(err);console.log("employeepredict.js base error")}
            res.send(recordset);
        });
    });
}

const KUDOS = (req, res) => {
    if (req.body.description.length > 0) {
        Update.KUDOS(req.body)
        SendMail.EMAIL(req.body)
        res.send(("Thanks for sending a KUDOS!"))
    }
}

const UPWARD = (req, res) => {
    if (req.body.retain.length > 0 || req.body.lose.length > 0) {
        Update.UPWARD(req.body)
        SendMail.UPWARD(req.body)
        res.send("Thanks for sending a ROLO!")
    }
}

const DOWNWARD = (req, res) => {
    if (req.body.retain.length > 0 || req.body.lose.length > 0) {
        Update.DOWNWARD(req.body)
        SendMail.DOWNWARD(req.body)
        res.send("Thanks for sending a ROLO!")
    }
}

module.exports = {
    BASE: BASE,
    KUDOS: KUDOS,
    UPWARD: UPWARD,
    DOWNWARD: DOWNWARD
}
