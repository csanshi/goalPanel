import { formatDurationToTimer } from '../../utils/dateTimeUtil'
import { showModal } from '../../utils/UIUtil.js'
import TimerState from '../../config/timerState'

const globalEnv = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goalTitle: '',
        goalId: '',
        isOngoing: true,
        pauseImg: '../../images/timer/pause.png',
        resumeImg: '../../images/timer/resume.png',
        timer: '00:00:00'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {    // 根据options来区分本页面的两个入口三种状态 ：home(NONE | ONGOING | PAUSE), detail(NONE)  
        const timerInfo = globalEnv.data
        console.log('timer/index ')
        console.log(options)
        console.log(timerInfo.timerState + '  ' + TimerState.NONE)
        this.setData({
            goalTitle:
                timerInfo.timerState === TimerState.NONE
                    ? decodeURIComponent(options.goalTitle)
                    : timerInfo.goalTitle,
            goalId:
                timerInfo.timerState === TimerState.NONE
                    ? options.goalId
                    : timerInfo.goalId
        })
        this.initCounter()
        console.log(this.data.goalTitle)
    },

    onPauseOrResume(){
        this.setData({
            isOngoing: !this.data.isOngoing
        })
        this.data.isOngoing ? this.startCounter() : this.pauseCounter()
    },

    onFinish(){
        const timerInfo = globalEnv.data
        const { goalId, goalTitle, beginDate, duration } = timerInfo
        this.stopCounter()
        wx.redirectTo({
            url: `/pages/summary/index?goalId=${goalId}&goalTitle=${encodeURIComponent(goalTitle)}&beginDate=${beginDate}&endDate=${Date.now()}&duration=${duration}`,
        })
    },

    onAbort(){
        showModal(
            '',
            '是否取消本次记录',
            () => {
                this.stopCounter()
                wx.navigateBack({
                    delta: 1
                })
            },
            null
        )
    },



    initCounter(){
        const timerInfo = globalEnv.data

        switch(timerInfo.timerState){
            case TimerState.ONGOING:
            case TimerState.NONE:
                this.setData({
                    timer: formatDurationToTimer(timerInfo.duration)
                })
                this.startCounter()
                break
            case TimerState.PAUSE:
                this.setData({
                    timer: formatDurationToTimer(timerInfo.duration),
                    isOngoing: false
                })
                break
        }
    },

    startCounter(){
        this.setData({
            isOngoing: true
        })

        const { goalId, goalTitle } = this.data

        globalEnv.startTimer(goalId, goalTitle, duration => {
            this.setData({
                timer: formatDurationToTimer(duration)
            })
        })
    },

    pauseCounter(){
        globalEnv.pauseTimer()
    },

    stopCounter(){
        globalEnv.stopTimer()
    }
})