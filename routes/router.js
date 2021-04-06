const express = require("express");
const router  = express.Router();
const app = express()
const history = require('connect-history-api-fallback')
//const MainPage  = require("./datadash/mainpage.js")
//const NextPage  = require("./datadash/nextpage.js")
const EPredict  = require("./employeepredict/employeepredict.js")
const HomeRoom  = require("./homeroom/homeroom.js")
const OfficeCheckOut = require('./checkout/test-checkout.js')
const TestSiteOfficeCheckOut = require('./checkout/checkout.js')
const OfficeSendMail = require('./checkout/sendmail.js')
const OfficeCancel = require('./checkout/cancel.js')
const MandM = require("./mandm/dashboard.js")
const MandMOther = require("./mandm/other.js")
const MandMRequest = require('./mandm/request.js')
const RandomKUDOS = require("./mandm/random.js")
const Serial = require("./serial/serial.js");
const Bingo = require("./bingo/call.js")
const Override = require("./bingo/override.js")
const OverridePost = require("./bingo/overridePost.js")
const Support = require("./support/sendmail.js");
const OfficeAvailability = require("./checkout/available.js")
const CheckClient = require("./clients/check-client.js")

app.use(history({
    rewrites:[
        {from: /^\/checkout\/.*$/, to: '/'},
        {from: /\/.*/, to:'/'}
    ]
}))

// router.get("/", (req, res) => {
//     res.send("nice")
//     MainPage.BASE(req, res);
// })

// router.get("/office/:id", (req, res) => {
//     MainPage.OFFICEONLY(req, res);
// })

// router.get("/client/:id", (req, res) => {
//     MainPage.CLIENTONLY(req, res);
// })

// router.get("/partner/:id", (req, res) => {
//     MainPage.PARTNERONLY(req, res);
// })

// router.get("/office/:id&/client/:client", (req, res) => {
//     MainPage.OFFICEANDCLIENT(req, res);
// })

// router.get("/office/:id&/partner/:partner", (req, res) => {
//     MainPage.OFFICEANDPARTNER(req, res);
// })

// router.get("/client/:id&/partner/:partner", (req, res) => {
//     MainPage.CLIENTANDPARTNER(req, res);
// })

// router.get("/client/:id&/partner/:partner&/office/:office", (req, res) => {
//     MainPage.ALLPARAMS(req, res);
// })

// router.get("/:page", (req, res) => {
//     NextPage.BASE(req, res);
// })

// router.get("/office/:id/:page", (req, res) => {
//     NextPage.OFFICEONLY(req, res);
// })

// router.get("/client/:id/:page", (req, res) => {
//     NextPage.CLIENTONLY(req, res);
// })

// router.get("/partner/:id/:page", (req, res) => {
//     NextPage.PARTNERONLY(req, res);
// })

// router.get("/office/:id&/client/:client/:page", (req, res) => {
//     NextPage.OFFICEANDCLIENT(req, res);
// })

// router.get("/office/:id&/partner/:partner/:page", (req, res) => {
//     NextPage.OFFICEANDPARTNER(req, res);
// })

// router.get("/client/:id&/partner/:partner/:page", (req, res) => {
//     NextPage.CLIENTANDPARTNER(req, res);
// })

// router.get("/client/:id&/partner/:partner&/office/:office/:page", (req, res) => {
//     NextPage.ALLPARAMS(req, res);
// })

router.get("/employees/:name", (req, res) => {
    EPredict.BASE(req, res)
})

// app.use('/employees', require('./employeepredict/employeepredict.js'))

router.post("/employees/", (req, res, next) => {
    EPredict.KUDOS(req, res, next)
})

router.post("/employees/upward", (req, res) => {
    EPredict.UPWARD(req, res)
})

router.post("/employees/downward", (req, res) => {
    EPredict.DOWNWARD(req, res)
})

router.get("/homeroom/:name", (req, res) => {
    HomeRoom.BASE(req, res)
})

router.post("/homeroom/", (req, res) => {
    HomeRoom.TPOST(req, res)
})

// router.post("/homeroom-member/", (req, res) => {
//     HomeRoom.MPOST(req, res)
// })

// router.post("/homeroom-test/", (req, res) => {
//     HomeRoom.TPOST(req, res)
// })

router.get("/test-checkout/:site", (req, res) => {
    TestSiteOfficeCheckOut.BASE(req, res)
})

router.get("/test-checkout/:site/:id", (req, res) => {
    TestSiteOfficeCheckOut.SPECIFIC(req, res)
})

router.post("/test-checkout/:site/:id", (req, res) => {
    TestSiteOfficeCheckOut.CHECKOUT(req, res)
    OfficeSendMail.EMAIL(req.body)
})

router.get("/offices", (req, res) => {
    OfficeCheckOut.BASE(req, res)
})

router.get("/offices/:id", (req, res) => {
    OfficeCheckOut.SPECIFIC(req, res)
})

router.post("/offices/:id", (req, res) => {
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
    TestSiteOfficeCheckOut.GETSTANDUP(req, res)
})

router.get("/offices/nonstandup/:site", (req, res) => {
    TestSiteOfficeCheckOut.GETNONSTANDUP(req, res)
})

router.get("/staff/:id", (req, res) => {
    OfficeCheckOut.STAFF(req, res)
})

router.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/checkout.html")
})

router.get("/mandm/:id", (req, res) => {
    MandM.BASE(req, res)
})

router.post("/mandm/request", (req, res) => {
    MandMRequest.BASE(req, res)
})

// router.post("/mandm/other", (req, res) => {
//     MandMOther.POST(req, res)
// })

// router.get("/kudos/:cornerstone", (req, res) => {
//     RandomKUDOS.BASE(req, res)
// })

router.get("/kudos", (req, res) => {
    res.sendFile(__dirname + "/views/kudos.html")
})

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

router.get("/bingo", (req, res) => {
    res.sendFile(__dirname + '/views/bingo.html')
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

router.get("/bingo/override", (req, res) => {
    res.sendFile(__dirname + "/views/override.html")
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