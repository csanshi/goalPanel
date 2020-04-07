import * as echarts from "../../libs/ec-canvas/echarts"
import pieOptions from '../../config/pieDefOption'  
import { showToast } from '../../utils/UIUtil'
import HomeModel from '../../models/home'
import TimerState from '../../config/timerState'
import { formatDurationToTimer } from '../../utils/dateTimeUtil'

const globalEnv = getApp()
let pie = null

Page({
///////////////////////////////////////////////////////////////////
///////////////////////// 生命周期及其他构造函数

    /**
     * 页面的初始数据
     */
    data: {
        pieOpt: {},
        userInfo: null,
        goalList: null,
        wholeTime: '',
        isDataLoaded: false,
        isPieInited: false,
        isCreating: false,
        isUploading: false,
        timerGoalTitle: '',
        timer: '00:00:00',
        TimerState: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initUserInfo()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        const $chart = this.selectComponent('#chart')
        $chart.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, {
                width,
                height
            })
            canvas.setChart(chart)
            this.pie = chart
            this.data.isPieInited = true
            if(this.data.isDataLoaded){
                this.updatePieOption()
            }
            return chart
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // 若初始化id失败则在catch中初始化userId，否则直接获取列表
        this.initOpenIdAndUserId()
            .then()
            .catch(err => {
                if (err === 0) {
                    return this.initUserId()
                }
            })
            .then(() => {
                this.getGoalList()
            })

        this.setTimerTips()
    },

    onAuthorize: function(e){   //点击授权
        if (e.detail.userInfo) {    //同意授权
            this.setData({
                userInfo: e.detail.userInfo
            })
        }
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: 'I am using goalPanel.'
        }
    },
///////////////////////////////////////////////////////////////////
///////////////////////// 登陆相关
    /**
     * 获取用户的历史授权信息、获取昵称和头像并且setData以渲染页面
     */
    initUserInfo(){
        HomeModel.getUserInfo().then(
            res => {
                this.data.userInfo = res.userInfo
                this.setData({
                    userInfo: res.userInfo
                })
            },
            err => {
                showToast('请先授权登陆')
            }
        )
    },

    /**
     * 通过Model调用云函数login，查users表，返回openid和userid（无则为null）
     */
    initOpenIdAndUserId(){
        return new Promise((resolve, reject) => {
            HomeModel.getOpenIdAndUserId().then(
                res => {
                    const idData = res.result
                    globalEnv.data.openId = idData.openId
                    if(idData.userId){
                        globalEnv.data.userId = idData.userId
                        resolve()
                    }else{
                        reject(0)
                    }
                },
                err => {
                    if(err.errCode === -1){
                        showToast('网络不佳，登陆失败')
                    }else{
                        showToast('登陆失败，错误码：${err.errCode}')
                    }
                    reject(-1)
                }
            )
        })
    },

    /**
     * 调用HomeModel.addUserId()，在users表中添加用户
     */
    initUserId(){
        return new Promise((resolve, reject) => {
            HomeModel.addUserId().then(
                res => {
                    globalEnv.data.userId = res._id
                    resolve()
                },
                err => {
                    showToast('添加用户id失败，错误码: ${err.errCode}')
                    reject()
                }
            )
        })
    },


///////////////////////////////////////////////////
////////////////////////// 获取渲染的数据

    getGoalList: function(){
        HomeModel.getGoalList(globalEnv.data.userId).then(
            res => {
                if(!res.result){
                    this.setData({
                        goalList: []
                    })
                    return
                }
                const formattedData = HomeModel.formatGoalList(res.result.data)
                this.setData({
                    goalList: formattedData.list,
                    wholeTime: formattedData.wholeTime
                })

                this.data.isDataLoaded = true
                if(this.data.isPieInited){
                    this.updatePieOption()
                }
            },
            
            err => {
                showToast('获取列表失败')
            }
        )
    },

    setTimerTips() {
        const timerInfo = globalEnv.data
        let stateDesc = ''

        switch (timerInfo.timerState) {
            case TimerState.NONE:
                stateDesc = ''
                break
            case TimerState.PAUSE:
                stateDesc = '暂停中'
                this.setData({
                    timer: formatDurationToTimer(timerInfo.duration),
                    timerGoalId: timerInfo.goalId
                })
                break
            case TimerState.ONGOING:
                stateDesc = '进行中'
                this.setData({
                    timer: formatDurationToTimer(timerInfo.duration)
                })
                globalEnv.startTimer(null, null, duration => {
                    this.setData({
                        timer: formatDurationToTimer(duration),
                        timerGoalId: timerInfo.goalId
                    })
                })
        }
        this.setData({
            timerState: stateDesc,
            timerGoalTitle: timerInfo.goalTitle
        })
    },

    updatePieOption: function () {
        const data = HomeModel.serializeForChart(this.data.goalList)
        const { min, max, list } = data
        const option = pieOptions
        option.visualMap.min = min
        option.visualMap.max = max
        option.series[0].data = list
        this.pie.setOption(option)
    },

///////////////////////////////////////////////////
////////////////////////// 事件处理函数

    onCreateGoal(){
        if(!this.data.userInfo){
            showToast('请先授权登陆')
            return
        }
        this.setData({
            isCreating: true
        })
    },

    onCancelCreate(){
        this.setData({
            isCreating: false
        })
    },

    onAddGoal(e){
        const goalTitle = e.detail
        if(!goalTitle.length){
            showToast('标题不能为空')
            return
        }

        if(this.data.isUploading){
            return
        }

        this.data.isUploading = true    // 处理延迟。相当于加锁！！
        HomeModel.addGoal(globalEnv.data.userId, goalTitle).then(
            res => {
                this.setData({
                    isCreating: false
                })
                this.data.isUploading = false   // 数据库操作完毕，解锁！！
                showToast('创建成功', true)
                this.getGoalList()
            },

            err => {
                this.setData({
                    isCreating: false,
                    isUploading: false
                })
                showToast('创建失败')
            }
        )

    },

    onGoalClick(e){
        const { goalId } = e.currentTarget.dataset

        wx.navigateTo({
            url: `/pages/detail/index?id=${goalId}`,
        })
    },

    onJumpToTimerPage(){
        wx.navigateTo({
            url: '/pages/timer/index'
        })
    },
})