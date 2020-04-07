// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {  //返回一个promise
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID

    const result = await db
        .collection('users')
        .where({
            _openid: openId
        })
        .get()

    const idData = result.data[0]   //如果无数据，不是返回null，而是[]

    return {
        userId: idData && idData._id && idData._openid ? idData._id : null,
        openId
    }
}