const express = require("express");
const router  = express.Router();
const app = express()
const history = require('connect-history-api-fallback')
//const MainPage  = require("./datadash/mainpage.js")
//const NextPage  = require("./datadash/nextpage.js")
// const EPredict  = require("./employeepredict/employeepredict.js")
// const HomeRoom  = require("./homeroom/homeroom.js")
const OfficeCheckOut = require('./checkout/checkout.js')
const OfficeSendMail = require('./checkout/sendmail.js')
const OfficeCancel = require('./checkout/cancel.js')
// const MandM = require("./mandm/dashboard.js")
// const MandMOther = require("./mandm/other.js")
// const MandMRequest = require('./mandm/request.js')
// const RandomKUDOS = require("./mandm/random.js")
const Serial = require("./serial/serial.js");
const Bingo = require("./bingo/call.js")
const Override = require("./bingo/override.js")
const OverridePost = require("./bingo/overridePost.js")
const Support = require("./support/sendmail.js");
const OfficeAvailability = require("./checkout/available.js")
const CheckClient = require("./clients/check-client.js")
const MandMTest = require('./mandm/testing/request.js')
const MandMTestROLO = require('./mandm/testing/rolos.js')
const MandMTestKUDOS = require('./mandm/testing/kudos.js')
const MandMTestHOMEROOM = require('./mandm/testing/homeroom.js')
const MandMTestMENTOR = require('./mandm/testing/mentor.js')
const MandMTestDASHBOARD = require('./mandm/testing/dashboard.js')
const MandMTestGROW = require('./mandm/testing/grow.js')
const PE = require('./mandm/testing/peapis.js')

// app.use(history({
//     rewrites:[
//         {from: /^\/checkout\/.*$/, to: '/'},
//         {from: /\/.*/, to:'/'}
//     ]
// }))

router.get("/bingo", (req, res) => {
    res.sendFile(__dirname + '/views/bingo.html')
})

router.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/checkout.html")
})

router.get("/bingo/override", (req, res) => {
    res.sendFile(__dirname + "/views/override.html")
})

router.post('/testing', (req, res) => {
    MandMTest.BASE(req, res)
})

router.post('/testing/getrequests', (req, res) => {
    MandMTest.GET(req, res)
})

router.post('/testing/employees', (req, res) => {
    PE.getEmployee(req, res)
})

router.post('/testing/rolo', (req, res) => {
    MandMTestROLO.ROLO(req, res)
})

router.post('/testing/delete', (req, res) => {
    MandMTestROLO.DELETE(req, res)
})

router.post('/testing/getoutstanding', (req, res) => {
    MandMTest.OUTSTANDING(req, res)
})

router.post('/testing/kudos', (req, res) => {
    MandMTestKUDOS.KUDOS(req, res)
})

router.post('/testing/homeroom', (req, res) => {
    MandMTestHOMEROOM.getHomeroomMembers(req, res)
})

router.post('/testing/homeroom/check', (req, res) => {
    if (req.body.checked.length >= 1) {
        MandMTestHOMEROOM.memberCheckIn(req, res)
    }

    if (req.body.memberChecked === 1) {
        MandMTestHOMEROOM.getHomeroomLeaders(req, res)
    }
})

router.post('/testing/mentor', (req, res) => {
    MandMTestMENTOR.mentorMeeting(req, res)
})

router.post('/testing/dashboard', (req, res) => {
    MandMTestDASHBOARD.dashboard(req, res)
})

router.post('/testing/grow', (req, res) => {
    MandMTestGROW.GROW(req, res)
})

// router.get("/employees/:name", (req, res) => {
//     EPredict.BASE(req, res)
// })

// router.post("/employees/", (req, res, next) => {
//     EPredict.KUDOS(req, res, next)
// })

// router.post("/employees/upward", (req, res) => {
//     EPredict.UPWARD(req, res)
// })

// router.post("/employees/downward", (req, res) => {
//     EPredict.DOWNWARD(req, res)
// })

// router.get("/homeroom/:name", (req, res) => {
//     HomeRoom.BASE(req, res)
// })

// router.post("/homeroom/", (req, res) => {
//     HomeRoom.TPOST(req, res)
// })

// router.post("/homeroom-member/", (req, res) => {
//     HomeRoom.MPOST(req, res)
// })

// router.post("/homeroom-test/", (req, res) => {
//     HomeRoom.TPOST(req, res)
// })

router.get("/test-checkout/:site", (req, res) => {
    OfficeCheckOut.BASE(req, res)
})

router.get("/test-checkout/:site/:id", (req, res) => {
    OfficeCheckOut.SPECIFIC(req, res)
})

router.post("/test-checkout/:site/:id", (req, res) => {
    OfficeCheckOut.CHECKOUT(req, res)
    OfficeSendMail.EMAIL(req.body)
})

router.get("/offices/cancel/:id", (req, res) => {
    OfficeCancel.CANCEL(req, res)
    //OfficeSendMail.CANCEL(req.body)
})

router.post("/offices/cancel/confirm", (req, res) => {
    OfficeCancel.BASE(req, res)
})

router.get("/offices/available/:site/:id", (req, res) => {
    OfficeAvailability.AVAILABLE(req, res)
})

router.get("/offices/standup/:site", (req, res) => {
    OfficeCheckOut.GETSTANDUP(req, res)
})

router.get("/offices/nonstandup/:site", (req, res) => {
    OfficeCheckOut.GETNONSTANDUP(req, res)
})

router.get("/staff/:id", (req, res) => {
    OfficeCheckOut.STAFF(req, res)
})

// router.get("/mandm/:id", (req, res) => {
//     MandM.BASE(req, res)
// })

// router.post("/mandm/request", (req, res) => {
//     MandMRequest.BASE(req, res)
// })

// router.post("/mandm/other", (req, res) => {
//     MandMOther.POST(req, res)
// })

// router.get("/kudos/:cornerstone", (req, res) => {
//     RandomKUDOS.BASE(req, res)
// })

// router.get("/kudos", (req, res) => {
//     res.sendFile(__dirname + "/views/kudos.html")
// })

router.get("/serial", (req, res) => {
    res.sendFile(__dirname + '/views/serial.html')
})

router.get("/serial/:id", (req, res) => {
    Serial.BASE(req, res)
})

router.post("/serial/sp4", (req, res) => {
    Serial.SP_POST(req, res)
})

router.post("/serial/splt", (req, res) => {
    Serial.LT_POST(req, res)
})

router.get("/bingo/number", (req, res) => {
    Bingo.BASE(req, res)
})

router.get("/bingo/called", (req, res) => {
    Bingo.DATES(req, res)
})

router.post("/bingo/number", (req, res) => {
    Bingo.POST(req, res)
})

router.post("/bingo/reset", (req, res) => {
    Bingo.RESET(req, res)
})

router.get("/bingo/override/list", (req, res) => {
    Override.BASE(req, res)
})

router.post("/bingo/override/list", (req, res) => {
    OverridePost.POST(req, res)
})

router.post("/support", (req, res) => {
    //console.log(req.body)
    Support.BASE(req.body)
})

router.get("/test", (req, res) => {
    OfficeCancel.CANCEL(req, res)
})

router.post("/clients" , (req, res) => {
    CheckClient.BASE(req, res)
})

router.post("/clients/mylist", (req, res) => {
    CheckClient.SHOWCLIENTS(req, res)
})

router.post("./clients/myjobs", (req, res) => {
    CheckClient.SHOWSTATUS(req, res)
})

module.exports = router;