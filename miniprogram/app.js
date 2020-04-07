import TimerState from './config/timerState'
//import TimerState from './config/timerState.jS' // 可否？


App({
    /**
     * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
     */
    onLaunch: function() {
        if (!wx.cloud) {
            console.error("请使用2.2.3或以上的基础库以使用云能力")
        } else {
            wx.cloud.init({
                traceUser: true
            })
        }

        this.data = { //这些初始化数据写在app的data里是否等价？与onLaunch的执行顺序？
            timerId: -1,
            timerState: TimerState.NONE,    //在startTimer中区分 1）初始计时 2）from暂停
            goalId: '',
            goalTitle: '',
            duration: 0,
            beginDate: 0,
            pauseDate: 0,
            pauseDuration: 0,
            bgm: wx.getBackgroundAudioManager()
        }
    },


    startTimer(goalId, goalTitle, onCount){
        const { data } = this
        const { timerState, timerId } = data

        if(timerState === TimerState.NONE){//初始启动计时器
            data.goalId = goalId
            data.goalTitle = goalTitle
            data.beginDate = Date.now()
        }else if(timerState === TimerState.PAUSE){//暂停->开始
            data.pauseDuration = data.pauseDuration + (Date.now() - data.pauseDate)//累加暂停持续时间
            data.pauseDate = 0
        }

        data.timerState = TimerState.ONGOING

        if(timerId !== -1){ // 应该不存在timerId ！== -1的情况吧？
            clearInterval(timerId)
        }

        const {beginDate, pauseDuration} = data

        data.duration = Date.now() - beginDate - pauseDuration
        onCount(data.duration)
        const newTimerId = setInterval(()=>{
            data.duration = Date.now() - beginDate - pauseDuration
            onCount(data.duration)
        }, 1000)
        this.data.timerId = newTimerId
    },

    pauseTimer(){
        this.data.pauseDate = Date.now()
        clearInterval(this.data.timerId)
        this.data.timerId = -1
        this.data.timerState = TimerState.PAUSE
    },

    stopTimer(){
        clearInterval(this.data.timerId)
        this.data.timerId = -1
        this.data.timerState = TimerState.NONE
        this.data.goalId = ''
        this.data.goalTitle = ''
        this.data.duration = 0
        this.data.pauseDuration = 0
        this.data.beginDate = 0
        this.data.pauseDate = 0
    },

    /**
     * 当小程序启动，或从后台进入前台显示，会触发 onShow
     */
    onShow: function(options) {

    },

    /**
     * 当小程序从前台进入后台，会触发 onHide
     */
    onHide: function() {

    },

    /**
     * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
     */
    onError: function(msg) {

    }
})