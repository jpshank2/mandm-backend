const axios = require("axios");
const qs = require('qs')

const baseURL = "https://bmss.pehosted.com/pe/api/"

const GET_TOKEN = async () => {
    const url = 'https://bmss.pehosted.com/auth/connect/token'
    const tokenData = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': process.env.PE_CLIENT_ID,
        'client_secret': process.env.PE_CLIENT_SECRET 
    })

    const tokenConfig = {
        method: 'post',
        url: url,
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : tokenData
    }

    const token = await axios(tokenConfig)
    return token.data.access_token
}

const GET_STAFF_INFO = async (staff) => {
    const url = baseURL + "staffmember/whois/"
    const staffConfig = {
        method: 'get',
        url: url + staff,
        headers: {
            "Authorization": `Bearer ${await GET_TOKEN()}`
        }
    }
    
    const resultStaff = await axios(staffConfig)

    return resultStaff.data
}

const GET_MY_INDEX = async (staff, token) => {
    const url = baseURL + "staffmember/find/"
    let resultStaff
    let tries = 0
    let staffToTry
    let staffConfig = {
        method: "post",
        url: url,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    while (!resultStaff) {
        if (tries === 0) {
            staffToTry = staff
        } else {
            let staffNameArray = staff.split(" ")
            staffToTry = staffNameArray[staffNameArray.length - tries]
        }

        let staffData = JSON.stringify({
            "Page": 1,
            "PageSize": 5,
            "Search": staffToTry,
            "OrderBy": "StaffName"
        })

        staffConfig.data = staffData

        tries++
        
        let results = await axios(staffConfig)

        resultStaff = results.data.Results[0]
    }

    return resultStaff
}

const GET_EMPLOYEES = (req, res) => {
    const url = baseURL + "staffmember/find/"
    const getEmployees = async (staff) => {
        let data = JSON.stringify({
            "Page": 1,
            "PageSize": 5,
            "Search": staff,
            "OrderBy": "StaffName"
        })
        
        let staffConfig = {
            method: "post",
            url: url,
            headers: {
                "Authorization": `Bearer ${await GET_TOKEN()}`,
                "Content-Type": "application/json"
            },
            data: data
        }
        
        let results = await axios(staffConfig)

        return results.data.Results
    }

    getEmployees(req.body.reviewedEmployee)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.log(err)
        })
}

const GET_HOMEROOM_MEMBERS = (leaderName, token) => {
    const getLeaders = async (leaderName, token) => {
        const url = baseURL + "StaffMember/GridReference"
        let leaderConfig = {
            method: "get",
            url: url,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }

        let homerooms = await axios(leaderConfig)
        return homerooms.data.SubDepartments.filter(leader => {return leader.CatName === leaderName})
    }

    const getMembers = async (leaderCode, token) => {
        let memberInfo = await leaderCode
        if (memberInfo.length > 0) {
            const url = baseURL + "StaffMember/ExtendedGridData"
            let data = JSON.stringify({
                "Code": "",
                "Name": "",
                "Surname": "",
                "EMail": "",
                "SubDepartment": memberInfo[0].Category,
                "Organisation": null,
                "User": "",
                "Status": "C",
                "Columns": [],
                "Skip": 0,
                "Sort": [],
                "Take": 10000,
                "FilteredColumns": false
            })
    
            let memberConfig = {
                method: "post",
                url: url,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                data: data
            }
    
            let members = await axios(memberConfig)
            return {status: 200, Results: members.data.Results}
        } else {
            return [{status: 400}]
        }
    }

    return getMembers(getLeaders(leaderName, token), token)
}

const GET_MY_HOMEROOM = (myName, token) => {
    const getMyHomeroom = async (myName, token) => {
        let myHomeroom
        let i = 0
        const getAllHomerooms = async () => {
            const homeroomsURL = baseURL + 'StaffMember/GridReference'
            let leaderConfig = {
                method: "get",
                url: homeroomsURL,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }

            let homerooms = await axios(leaderConfig)
            return homerooms.data.SubDepartments
        }

        const findMyHomeroom = async (leaderCode, token) => {
            const url = baseURL + "StaffMember/ExtendedGridData"
            if (leaderCode) {
                let data = JSON.stringify({
                    "Code": "",
                    "Name": "",
                    "Surname": "",
                    "EMail": "",
                    "SubDepartment": leaderCode.Category,
                    "Organisation": null,
                    "User": "",
                    "Status": "C",
                    "Columns": [],
                    "Skip": 0,
                    "Sort": [],
                    "Take": 10000,
                    "FilteredColumns": false
                })
    
                let memberConfig = {
                    method: "post",
                    url: url,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    data: data
                }
    
                let members = await axios(memberConfig)
                // console.log(members.data.Results)
                if (members.data.Results.find(member => {return member.StaffName === myName})) {
                    return leaderCode.CatName
                } else {
                    return undefined
                }
            } else {
                return 'Unknown'
            }
        }

        const homerooms = await getAllHomerooms()

        while (!myHomeroom) {
            myHomeroom = await findMyHomeroom(homerooms[i], token)
            if (myHomeroom) {
                return myHomeroom
            }
            i++
        }

        return myHomeroom
    }
    return getMyHomeroom(myName, token)
}

module.exports = {
    getToken: GET_TOKEN,
    getStaffInfo: GET_STAFF_INFO,
    getMyIndex: GET_MY_INDEX,
    getEmployee: GET_EMPLOYEES,
    getHomeroom: GET_HOMEROOM_MEMBERS,
    getMyHomeroom: GET_MY_HOMEROOM
}
