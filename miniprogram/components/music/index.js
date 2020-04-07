// components/music.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        musicImg: String,
        musicUrl: String,
        musicTitle: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        on: true
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClick(e){
            this.on = !this.on
            this.setData({
                on: this.on
            })
            if(this.on){
                this.triggerEvent("musicOn", {}, {})
            }else{
                this.triggerEvent('musicOff', {}, {})
            }
        },
    },

    pageLifetimes: {
        show: function () {
            // 页面被展示
        },
        hide: function () {
            // 页面被隐藏
        },
        resize: function (size) {
            // 页面尺寸变化
        }
    },

    lifetimes: {
        attached: function () {
            // 在组件实例进入页面节点树时执行
            //getApp().data.bgm.src = musicUrl
        },
        ready: function(){
            getApp().data.bgm.title = this.properties.musicTitle
            getApp().data.bgm.src = this.properties.musicUrl
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },
})
