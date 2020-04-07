import { formatDurationToStr, formatDateTime } from '../utils/dateTimeUtil'
const db = wx.cloud.database()

export default class HomeModel{
    static getUserInfo(){
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: res => {
                    if(res.authSetting['scope.userInfo']){
                        //已经授权
                        wx.getUserInfo({
                            success: res => {
                                resolve(res)
                            }
                        })
                    }else{
                        reject(res)
                    }
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    }

    static getOpenIdAndUserId(){
        return wx.cloud.callFunction({
            name: 'login',
            data: {}
        })
    }

    static addUserId(){
        return db.collection('users').add({
            data: {}
        })
    }

    static getGoalList(userId){
        console.log('model/home/getGoalList')
        console.log(userId)
        return wx.cloud.callFunction({
            name: 'getGoalList',
            data: {
                userId
            }
        })
    }

    static addGoal(userId, goalTitle){
        return wx.cloud.callFunction({
            name: 'createGoal',
            data: {
                userId,
                goalTitle
            }
        })
    }

    static formatGoalList(list){
        let wholeTime = 0
        list.forEach(goal => {
            goal.lastUpdate = formatDateTime(goal.lastUpdate)
            wholeTime += goal.time
            goal.duration = formatDurationToStr(goal.time)
            goal.time = (goal.time/(60*60*1000)).toFixed(3) //以小时为单位，保留三位小数
        })
        return { list, wholeTime: formatDurationToStr(wholeTime) }
    }

    static serializeForChart(list){
        const charTData = []
        let min = 0
        let max = 0
        list.forEach((goal, index) => {
            const { time, title } = goal
            if(index === 0){
                min = time
                max = time
            }else{
                min = min > time ? time : min
                max = max < time ? time : max
            }
            const data = {
                value: time,
                name: title
            }
            charTData.push(data)
        })
        return {
            min,
            max,
            list: charTData
        }
    }
}