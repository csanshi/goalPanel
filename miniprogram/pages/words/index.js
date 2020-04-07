Page({
    data: {
        
    },

    onMusicOn(e) {
        getApp().data.bgm.play()
    },

    onMusicOff(e) {
        getApp().data.bgm.pause()
    },
})