const nodemailer = require('nodemailer')
const PE = require('./peapis.js')
const moment = require("moment")

let pooledTransporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EM_USER,
        pass: process.env.EM_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    maxMessages: 3,
    maxConnections: 3
})

const REQUEST = async (requestData) => {
    try {
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: requestData.recipient.StaffEMail,
            cc: requestData.sender.StaffEMail,
            subject: `${requestData.sender.StaffName} is Requesting a ROLO for ${requestData.project}`,
            html: `<p>${requestData.recipient.StaffName}</p><p>${requestData.sender.StaffName} is requesting a ROLO for ${requestData.project}. Please use the M+M Outlook plugin to give them feedback. Thanks in advance for filling out this ROLO!</p>`
        })
    } catch (err) {
        console.log(`Request email error - ${moment().format('LLL')}\n`)
        console.log(requestData)
        console.log(err)
    }
}

const HOMEROOM_MEMBER = async (memberCheckinData) => {
    try {
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: memberCheckinData.member.StaffEMail,
            subject: `Homeroom Leader Check in`,
            html: `<p>Thanks for letting us know you and your Homeroom Leader checked in together!</p>`
        })
    } catch (err) {
        console.log(`HR Member email error - ${moment().format('LLL')}\n`)
        console.log(memberCheckinData)
        console.log(err)
    }
}

const HOMEROOM_LEADER = async (leaderCheckinData) => {
    try {
        let token = await PE.getToken()
        let d = new Date()
        d = d.toString().substring(4, 15)
        let list = ""
        for (let i = 0; i < leaderCheckinData.checkedMembers.length; i++) {
            let MembersStaff = await PE.getMyIndex(leaderCheckinData.checkedMembers[i].staff, token)
            let ratingString = ''
            switch (parseInt(leaderCheckinData.checkedMembers[i].rating)) {
                case 5:
                    ratingString = 'Best week ever'
                    break;
                case 4:
                    ratingString = 'Pretty good week'
                    break;
                case 3:
                    ratingString = 'Just an okay week'
                    break;
                case 2:
                    ratingString = 'Not a good week'
                    break;
                default:
                    ratingString = 'Worst week ever'
            }
            list += `<li>${MembersStaff.StaffName} - ${ratingString}</li>`
        }
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: "hrussell@bmss.com",
            cc: "bshealy@bmss.com",
            bcc: leaderCheckinData.leader.StaffEMail,
            subject: `${leaderCheckinData.leader.StaffName} Checked In with their Homeroom`,
            html: `<h1 style="text-align: center">${d} Homeroom Check In</h1><br><h3>${leaderCheckinData.leader.StaffName} checked in with:</h3><ul>${list}</ul>`
        })
    } catch (err) {
        console.log(`HR Leader email error - ${moment().format('LLL')}\n`)
        console.log(leaderCheckinData)
        console.log(err)
    }
}

const KUDOS = async (kudosData) => {
    try {
        let d = new Date()
        d = d.toString().substring(4, 15)

        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: kudosData.recipient.StaffEMail,
            bcc: `zealhr@bmss.com; ${kudosData.sender.StaffEMail}`,
            subject: `Cornerstone KUDOS for ${kudosData.recipient.StaffName}`,
            html: `<h1 style="text-align: center">Cornerstone KUDOS</h1><br><p><strong>Employee Name: </strong>${kudosData.recipient.StaffName}</p><p><strong>What Cornerstone was exhibited? </strong>${kudosData.cornerstone}</p><p><strong>Submitted by: </strong>${kudosData.sender.StaffName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><p style="text-align: center">${kudosData.description}</p>`
        })
    } catch (err) {
        console.log(`KUDOS email error - ${moment().format('LLL')}\n`)
        console.log(kudosData)
        console.log(err)
    }
}

const ROLOS = async (rolosData) => {
    try {
        let token = await PE.getToken()
        let hrLeaderName = await PE.getMyHomeroom(rolosData.recipient.StaffName, token)
        let hrLeaderInfo = hrLeaderName === 'Unknown' ? '' : await PE.getMyIndex(hrLeaderName, token)
        let d = new Date()
        d = d.toString().substring(4, 15)
        let ratingString = ""

        if (rolosData.rating == 3) {
            ratingString = 'Thumbs Up'
        } else if (rolosData.rating == 1) {
            ratingString = 'Thumbs Down'
        } else {
            ratingString = 'Okay'
        }

        let ccString = hrLeaderInfo.StaffEMail

        switch (hrLeaderInfo.StaffEMail) {
            case "blorimer@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; acaldwell@bmss.com`
                break;
            case "munderhill@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; tzablan@bmss.com`
                break;
            case "jcarroll@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; astapler@bmss.com`
                break;
            case "mbrand@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; rbowers@bmss.com`
                break;
            case "rmendheim@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; rkitchen@bmss.com`
                break;
            case "kfluker@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; dbrock@bmss.com`
                break;
            case "bbrown@bmss.com":
                ccString = `${hrLeaderInfo.StaffEMail}; dbrock@bmss.com`
                break;
            default:
                leader = req.body.userName
                break;
        }

        if (rolosData.direction === 1) {
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: ccString,
                bcc: rolosData.sender.StaffEMail,
                subject: `ROLO - Upward for ${rolosData.recipient.StaffName}`,
                html: `<h1 style="text-align: center">ROLO - Upward</h1><br><p><strong>Employee Name: </strong>${rolosData.recipient.StaffName}</p><p><strong>Project: </strong>${rolosData.project}</p><p><strong>How did ${rolosData.recipient.StaffName} do on the project? </strong>${ratingString}</p><p><strong>Submitted by: </strong>${rolosData.sender.StaffName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${rolosData.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${rolosData.lose}</p>`
            })
        } else {
            pooledTransporter.sendMail({
                from: process.env.EM_USER,
                to: "zealhr@bmss.com",
                cc: `${ccString}; ${rolosData.recipient.StaffEMail}`,
                bcc: rolosData.sender.StaffEMail,
                subject: `ROLO - Downward for ${rolosData.recipient.StaffName}`,
                html: `<h1 style="text-align: center">ROLO - Downward</h1><br><p><strong>Employee Name: </strong>${rolosData.recipient.StaffName}</p><p><strong>Project: </strong>${rolosData.project}</p><p><strong>How did ${rolosData.recipient.StaffName} do on the project? </strong>${ratingString}</p><p><strong>Submitted by: </strong>${rolosData.sender.StaffName}</p><p><strong>Today's Date: </strong>${d}</p><br><br><h2 style="text-align: center">Retain</h2><p>${rolosData.retain}</p><br><h2 style="text-align: center">Lose</h2><p>${rolosData.lose}</p>`
            })
        }
    } catch (err) {
        console.log(`ROLOs email error - ${moment().format('LLL')}\n`)
        console.log(rolosData)
        console.log(err)
    }
}

const MENTOR = async (mentorData) => {
    try {
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: mentorData.StaffEMail,
            bcc: "zealhr@bmss.com",
            subject: `Met with Mentor`,
            html: `<p><strong>Employee Name: </strong>${mentorData.StaffName}</p><p>Thanks for letting us know you met with your mentor!</p>`
        })
    } catch (err) {
        console.log(`Mentor email error - ${moment().format('LLL')}\n`)
        console.log(mentorData)
        console.log(err)
    }
}

const GROW = async (growData) => {
    try {
        let subList = ''
        growData.submissions.forEach(submission => {
            switch(submission.heading) {
                case "Resume":
                    subList += '<li>Resume sent via email to Megan Carter/Heather Russell</li>'
                    break
                case "iSolve Completed":
                    subList += '<li>Candidate referred completes iSolve link sent by MC/HR</li>'
                    break
                case "Buddy Lunch":
                    subList += '<li>Buddy Lunch with new hire</li>'
                    break
                case "Contact Potential Candidate":
                    subList += '<li>Contacting potential candidate about job openings &#40;must provide name to MC/HR&#41;</li>'
                    break
                case "Post on SM":
                    subList += '<li>Post on LinkedIn/Facebook/etc. - hiring/recruiting specific</li>'
                    break
                case "Office Event":
                    subList += '<li>Participate in ZebraFest, What the Heck is Public Accounting, or any other in office event</li>'
                    break
                case "Referral from Profesor":
                    subList += '<li>Get BMSS a referral through a professor relationship</li>'
                    break
                case "Phone Screen":
                    subList += '<li>MC/HR completes phone screen with your referred candidate</li>'
                    break
                case "Campus Event":
                    subList += '<li>Attend on campus event</li>'
                    break
                case "Non Buddy Lunch":
                    subList += '<li>Take a &#40;non-buddy&#41; new hire to coffee/lunch</li>'
                    break
                case "Referral Meeting":
                    subList += '<li>Referred candidate comes in for a meeting</li>'
                    break
                case "Interview":
                    subList += '<li>Participate in an interview</li>'
                    break
                case "Speak on Campus":
                    subList += '<li>Speak at on campus event</li>'
                    break
                case "Speak in Class":
                    subList += '<li>Get BMSS opportunity to speak in class</li>'
                    break
                case "Formal Buddy":
                    subList += '<li>Formal buddy to new hire</li>'
                    break
                case "Present in Office":
                    subList += '<li>Present at ZebraFest, What the Heck is Public Account, or any other in office event</li>'
                    break
                default:
                    subList += '<li>Hired referred candidate</li>'
            }
        })
        pooledTransporter.sendMail({
            from: process.env.EM_USER,
            to: growData.StaffEMail,
            bcc: "zealhr@bmss.com",
            subject: 'Grow the Family',
            html: `<p><strong>Employee Name: </strong>${growData.sender.StaffName}</p><ul>${subList}</ul><p>Thanks for growing the family!</p>`
        })
    } catch (err) {
        console.log(`Grow email error - ${moment().format('LLL')}\n`)
        console.log(growData)
        console.log(err)
    }
}

module.exports = {
    request: REQUEST,
    member: HOMEROOM_MEMBER,
    leader: HOMEROOM_LEADER,
    kudos: KUDOS,
    rolos: ROLOS,
    mentor: MENTOR,
    grow: GROW
}
