// components/modal/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String
        },
        inputPlaceholder: {
            type: String
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        inputData: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onInput(e){
            this.data.inputData = e.detail.value
            this.triggerEvent('input', e.detail.value, {})
        },

        onConfirm(){
            this.triggerEvent('confirm', this.data.inputData, {})
        },

        onCancel(){
            this.triggerEvent('cancel', {}, {})
        }
    }
})
